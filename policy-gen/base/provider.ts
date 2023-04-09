// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as babel from "@babel/core";
import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as babeltypes from "@babel/types";
import * as eta from "eta";

// type SchemaMap = Map<string, Map<string, Map<string, string>>>;

export interface ProviderArgs {
    /**
     * Name of the provider.
     */
    name: string;
    /**
     * Version of the provider.
     */
    version: string;
    /**
     * Vendor's directory to use to save the generated policies and unit tests.
     */
    directory: string;
    /**
     * Generate policies and unit tests but do not save any files locally.
     */
    dryrun: boolean;
    /**
     * Vendor's name.
     */
    vendorName: string;
    /**
     * The template filename used to generate new `index.ts` as part of the `export` statement.
     */
    exportsTemplateFile: string;
    /**
     * The maximum number of policies to generate in a single run. Existing policies are skipped and not counted.
     */
    maxPolicyCount: number;
}


export class Provider {

    protected readonly args: ProviderArgs;

    // protected readonly name: string;
    protected readonly version: string;
    protected readonly directory: string;

    protected schema: string;
    protected schemaObject: any;

    protected schemaName: string;
    protected schemaVersion: string;

    // protected providerMap: Map<string, Map<string, Map<string, string>>> = new Map<string, Map<string, Map<string, string>>>();

    protected readonly basePath: string;
    protected templateBasePath: string;

    private policyCount: number = 0;

    constructor(args: ProviderArgs) {

        this.args = args;
        this.args.name = args.name;
        this.version = args.version;
        this.directory = path.resolve(args.directory);

        if (!fs.existsSync(this.directory)) {
            throw new Error(`The specified vendor directory doesn't exist (${this.directory}).`);
        }

        this.basePath = path.resolve(`${__dirname}/../templates`);

        this.downloadSchema();

        if (!this.schemaObject.hasOwnProperty("name")) {
            throw new Error(`this provider's schema (${this.args.name}@${this.version}) doesn't contain a name.`);
        }

        if (!this.schemaObject.hasOwnProperty("version")) {
            throw new Error(`this provider's schema (${this.args.name}@${this.version}) doesn't contain a version.`);
        }

        if (this.args.name !== this.schemaObject["name"]) {
            throw new Error(`this provider ${this.args.name}@${this.version} returned a different schema name '${this.schemaObject["name"]}'`);
        }

        const _schemaName: string = <string>this.schemaObject["name"];
        this.schemaName = _schemaName.replace(/-/g, "");

        if (this.version !== this.schemaObject["version"]) {
            throw new Error(`this provider ${this.args.name}@${this.version} returned a different schema version '${this.schemaObject["version"]}'`);
        }
        this.schemaVersion = <string>this.schemaObject["version"];

        this.templateBasePath = this.createTemplateDirectory(this.args.vendorName);
        eta.configure({
            autoTrim: [false, false],
            views: this.templateBasePath,
        });

        // this.schemaToMap();
    }

    /**********************************
     ******** Private methods. ********
     **********************************/

    private downloadSchema() {

        /*
         * The Azure Native provider takes ~225MB (2023/04/07).
         * So let's make sure we don't need to increase the buffer too often.
         */
        const bufferSize: number = 512*1024*1024;
        const s = spawnSync("pulumi", [
            "package",
            "get-schema",
            `${this.args.name}@${this.version}`,
        ], { maxBuffer: bufferSize });
        /**
         * You shouldn't use `output` because of this issue https://github.com/nodejs/node/issues/19218
         * For now, `stdout` is the way to go.
         */
        if (s.stdout.byteLength === bufferSize ) {
            throw new Error("the buffer size needs to be increased.");
        }
        this.schema = s.stdout.toString();
        this.schemaObject = JSON.parse(this.schema);
    }

    /**
     * This function creates an empty exports file with the correct top headers (copyright information).
     *
     * @param exportsFile The full path in which the exports headers will be saved in.
     */
    private createEmtpyExport(exportsFile: string) {

        if (fs.existsSync(exportsFile) || this.args.dryrun === true) {
            return;
        }

        const exportsTemplateFunction = eta.loadFile(`${this.templateBasePath}/${this.args.exportsTemplateFile}`, {
            filename: this.args.exportsTemplateFile,
        });

        const exportsSourceCode = eta.render(exportsTemplateFunction, {});

        const exportsFileHandle = fs.openSync(exportsFile, "w", 0o640);
        fs.appendFileSync(exportsFileHandle, exportsSourceCode);
        fs.closeSync(exportsFileHandle);

        return;
    }

    /**
     * This function updates an `index.ts` and adds the necessary `export` statements
     * based on the current directory content. This function only updates namespace `export` statements.
     *
     * @param exportsFile The full path to an `index.ts` that contains a series of `export` statements.
     */
    private updateNamespaceExport(exportsFile: string) {
        this.createEmtpyExport(exportsFile);
        /*
         * - List all subfolders.
         * - Load file with babel.
         * - For each subfolder.
         *   - If the subfolder name is NOT found in the list of list of namespaces
         *     - Add namespace import to the source code.
         *   - If namespace is NOT found in the subfolder list
         *     - Remove the namespace export from the code
         * - Ignore/skip any policy (local .ts files)
         * - Save source code back into the index.ts file,
         */

        const exportsFileText: string = fs.readFileSync(exportsFile, "utf-8");

        const exportsFileParseResults = parser.parse(exportsFileText, {
            attachComment: true,
            sourceType: "module",
            sourceFilename: exportsFile,
            plugins: [ "typescript" ],
        });

        const directory: string = path.dirname(exportsFile);
        const directoryEntries: string[] = fs.readdirSync(directory);

        for (let index = 0; index < directoryEntries.length; index++) {
            const subDirectory: string = directoryEntries[index];

            if (!fs.statSync(`${directory}/${subDirectory}`).isDirectory()) {
                /**
                 * We're checking namespace exports which are related to directories only.
                 * This is not a directory, so skipping to the next entry.
                 */
                continue;
            }

            let exportExists: boolean = false;

            traverse(exportsFileParseResults, {
                ExportNamedDeclaration(nodePath: NodePath<babeltypes.ExportNamedDeclaration>) {
                    if (nodePath.node.specifiers.length > 0 && babeltypes.isIdentifier(nodePath.node.specifiers[0].exported, { name: subDirectory })) {
                        exportExists = true;
                        nodePath.stop(); // stop traversing once we find the export
                    }
                },
            });

            if (!exportExists) {
                const newExport = parser.parse(`export * as ${subDirectory} from "./${subDirectory}";\n`, {
                    sourceType: "module",
                }).program.body[0];
                exportsFileParseResults.program.body.push(newExport);
            }
        }

        // FIXME: Need to remove namespace exports for which we don't find folders for?

        const transformedCode = babel.transformFromAstSync(exportsFileParseResults, undefined, {});

        if (!transformedCode || !transformedCode.code) {
            throw new Error(`Failed to generate code.`);
        }

        /*
         * FIXME: I haven't been able to find a clean way to insert
         * an empty line at the end of the license header and the 1st
         * export.So for now, I'm using a regular expression to insert
         * that line whenever it's missing.
         */
        const formattedCode: string = `${transformedCode.code.replace(/(SOFTWARE.)\n(export)/gm, "$1\n\n$2")}\n`;

        const exportsFileHandle = fs.openSync(exportsFile, "w", 0o640);
        fs.writeFileSync(exportsFileHandle, formattedCode);
        fs.closeSync(exportsFileHandle);
    }

    private updatePolicyExport(exportsFile: string, policyVariableName: string) {
        this.createEmtpyExport(exportsFile);
        /*
         * - List all files.
         * - Load file with babel.
         * - For each file.
         *   - If the file name is NOT found in the list of list of policy exports
         *     - Add policy import to the source code.
         *   - If policy is NOT found in the file list
         *     - Remove the policy export from the code
         * - Ignore/skip any policy (local .ts files)
         * - Save source code back into the index.ts file,
         */
        const exportsFileText: string = fs.readFileSync(exportsFile, "utf-8");

        const exportsFileParseResults = parser.parse(exportsFileText, {
            attachComment: true,
            sourceType: "module",
            sourceFilename: exportsFile,
            plugins: [ "typescript" ],
        });

        const directory: string = path.dirname(exportsFile);
        const directoryEntries: string[] = fs.readdirSync(directory);

        for (let index = 0; index < directoryEntries.length; index++) {
            const fileEntry: string = directoryEntries[index];

            if (!fs.statSync(`${directory}/${fileEntry}`).isFile()) {
                /**
                 * We're checking policy exports which are related to files only.
                 * This is not a file, so skipping to the next entry.
                 */
                continue;
            }

            let exportExists: boolean = false;

            traverse(exportsFileParseResults, {
                ExportNamedDeclaration(nodePath: NodePath<babeltypes.ExportNamedDeclaration>) {
                    if (nodePath.node.specifiers.length > 0 && babeltypes.isIdentifier(nodePath.node.specifiers[0].exported, { name: policyVariableName })) {
                        exportExists = true;
                        nodePath.stop(); // stop traversing once we find the export
                    }
                },
            });

            if (!exportExists) {
                const newExport = parser.parse(`export { ${policyVariableName} } from "./${policyVariableName}";\n`, {
                    sourceType: "module",
                }).program.body[0];
                exportsFileParseResults.program.body.push(newExport);
            }
        }

        // FIXME: Need to remove policy exports for which we don't find a file for?
        const transformedCode = babel.transformFromAstSync(exportsFileParseResults, undefined, {});

        if (!transformedCode || !transformedCode.code) {
            throw new Error(`Failed to generate code.`);
        }

        /*
         * FIXME: I haven't been able to find a clean way to insert
         * an empty line at the end of the license header and the 1st
         * export.So for now, I'm using a regular expression to insert
         * that line whenever it's missing.
         */
        const formattedCode: string = `${transformedCode.code.replace(/(SOFTWARE.)\n(export)/gm, "$1\n\n$2")}\n`;

        const exportsFileHandle = fs.openSync(exportsFile, "w", 0o640);
        fs.writeFileSync(exportsFileHandle, formattedCode);
        fs.closeSync(exportsFileHandle);

    }

    /**********************************
     ******** Protected methods. ******
     **********************************/

    /**
     * Saves the provided policy source code into the desired source file.
     *
     * @param specFile The relative path in which the `specSourceCode` should be saved into.
     * @param specSourceCode The policy spec source code to save.
     * @param resourceFile The relative path in which the `resourceSourceCode` should be saved into.
     * @param resourceSourceCode The resource.ts source code to save.
     */
    protected saveSpecFile(specFile: string, specSourceCode: string, resourceFile?: string, resourceSourceCode?: string) {

        if (this.args.dryrun === true) {
            return;
        }

        this.mkdirpSync(path.dirname(`${this.directory}/${specFile}`));

        if (!fs.existsSync(`${this.directory}/${specFile}`)) {
            const specFileHandle = fs.openSync(`${this.directory}/${specFile}`, "w", 0o640);
            fs.appendFileSync(specFileHandle, specSourceCode);
            fs.closeSync(specFileHandle);
        }

        this.mkdirpSync(path.dirname(`${this.directory}/${resourceFile}`));
        if (resourceFile && !fs.existsSync(`${this.directory}/${resourceFile}`) && resourceSourceCode && resourceSourceCode.length > 0) {
            const specFileHandle = fs.openSync(`${this.directory}/${resourceFile}`, "w", 0o640);
            fs.appendFileSync(specFileHandle, resourceSourceCode);
            fs.closeSync(specFileHandle);
        }
    }

    /**
     * Saves the provided policy source code into the desired source file.
     *
     * @param sourceFile The relative path in which the `policySourceCode` should be saved into.
     * @param policySourceCode The policy source code to save.
     * @param policyVariableName The policy variable name that holds the policy code.
     * @returns `false` to indicate the maximum number of generated polcies has been reached.
     * When to count?
     * - If sourceFile doesn't exist.
     */
    protected saveSourceFile(sourceFile: string, policySourceCode: string, policyVariableName: string): boolean {

        if (this.policyCount >= this.args.maxPolicyCount) {
            return false;
        }

        let currentDirectory: string = this.directory;
        const directoryParts: string[] = path.dirname(sourceFile).split("/");

        if (this.args.dryrun === true) {
            if (!fs.existsSync(`${this.directory}/${sourceFile}`)) {
                this.policyCount++;
            }
            return true;
        }

        /**
         * Break the directory into parts and ensure all directories
         * have been created before we attempt to save the `sourceFile`.
         */
        for(let index = 0; index < directoryParts.length; index++) {
            const part: string = directoryParts[index];
            currentDirectory = `${currentDirectory}/${part}`;

            /**
             * If the directory is missing, then we need to create it.
             */
            if (!fs.existsSync(currentDirectory)) {
                fs.mkdirSync(currentDirectory);
            }
        }

        /**
         * For each directory parts, we look into the relevant `index.ts`
         * to ensure we add any missing `export` statements in order to
         * correctly expose the policy we're about to save.
         */
        currentDirectory = this.directory;
        for(let index = 0; index < directoryParts.length; index++) {

            const part: string = directoryParts[index];
            currentDirectory = `${currentDirectory}/${part}`;

            const exportsFile: string = `${currentDirectory}/index.ts`;

            if (index !== (directoryParts.length - 1)) {
                this.updateNamespaceExport(exportsFile);
            } else {
                this.updatePolicyExport(exportsFile, policyVariableName);
            }
        }

        if (!fs.existsSync(`${this.directory}/${sourceFile}`)) {
            const sourceFileHandle = fs.openSync(`${this.directory}/${sourceFile}`, "w", 0o640);
            fs.appendFileSync(sourceFileHandle, policySourceCode);
            fs.closeSync(sourceFileHandle);
            this.policyCount++;
        }

        return true;
    }


    /**
     * Recursively create the specified directory.
     *
     * @param directoryPath Directory to create.
     */
    protected mkdirpSync(directoryPath: string): void {

        const directoryParts = directoryPath.split("/");
        let currentDirectory = "";
        for (const part of directoryParts) {
            currentDirectory += part + "/";
            if (!fs.existsSync(currentDirectory)) {
                fs.mkdirSync(currentDirectory);
            }
        }
    }

    /**
     * Create the template directory for the given vendor name and returns its full path.
     *
     * @param vendorName Vendor's name to create the template directories for.
     * @returns Return the full path of the vendor's template directory.
     */
    protected createTemplateDirectory(vendorName: string): string {

        const templatePath = path.resolve(`${this.basePath}/${vendorName}/${this.schemaName}`);

        this.mkdirpSync(templatePath);

        return templatePath;
    }

    /**********************************
     ********** Public methods. *******
     **********************************/
    public getName(): string {
        return this.schemaName;
    }

    public getVersion(): string {
        return this.schemaVersion;
    }

    public getSchemaJson(): string {
        return this.schema;
    }

    public getSchema(): any {
        return this.schemaObject;
    }
};
