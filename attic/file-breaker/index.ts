
/**
 * Other helpful commands
 *
 * 1. `index.ts` needs its exports to be updated
 *    ```bash
 *    find ../vendor-aws/awsnative -maxdepth 2 -mindepth 2 -type f -name index.ts -exec sed -i 's/";/\/";/;' {} \;
 *    ```
 */
import * as fs from "fs";
import * as path from 'path';
import * as commander from "commander";
import * as parser from "@babel/parser";
import * as parserTypes from "@babel/types";

function findFilesByExtension(directory: string, extension: string): string[] {
    const files: string[] = [];

    const dirContent = fs.readdirSync(directory);

    for (let index = 0; index < dirContent.length; index++) {
        let file = dirContent[index];
        const fullPath = path.join(directory, file);
        // console.log(fullPath);

        if (fs.statSync(fullPath).isDirectory()) {
            files.push(...findFilesByExtension(fullPath, extension));
        } else if (path.extname(file) === extension) {
            if (path.basename(file) !== "index.ts") {
                files.push(fullPath);
            }
        }
    }
    return files;
}

function extractLines(str: string, startLine: number, endLine: number): string {
    const lines = str.split('\n');
    const start = Math.max(0, startLine - 1);
    const end = Math.min(lines.length, endLine);
    return lines.slice(start, end).join('\n');
}

interface PolicyDetails {
    policyText: string;
    policyVariableName: string;
}

interface TestSuiteDetails {
    testSuiteText: string;
    testSuiteName: string;
    testSuiteResource: string;
    policyVariableName: string;
}

function cmd_run(sourceFile: string, specFile: string) {
    const sourceFileText: string = fs.readFileSync(sourceFile, "utf-8");
    const sourceFileDir: string = path.dirname(sourceFile);

    const sourceFileParseResults = parser.parse(sourceFileText, {
        attachComment: true,
        sourceType: "module",
        sourceFilename: sourceFile,
        plugins: [
            "typescript",
        ],
    });

    const resourceName: string = path.basename(sourceFile).replace(".ts", "");
    let sourceFileHeader: string = "";
    let sourceFileImports: string = "";
    let extractedPolicies: PolicyDetails[] = [];

    for (let codeBlockIndex = 0; codeBlockIndex < sourceFileParseResults.program.body.length; codeBlockIndex++) {
        const node = sourceFileParseResults.program.body[codeBlockIndex];

        /**
         * We extract the sourceFile headers and its imports
         */
        if (node.type === "ImportDeclaration") {

            /**
             * We extract the sourceFile top headers (copyright and license)
             */
            if (sourceFileHeader.length === 0) {
                if (!node.loc) {
                    throw new Error(`Unable to locate last line of 'import' in ${sourceFile}`);
                }
                sourceFileHeader = extractLines(sourceFileText, 0, node.loc.start.line-2)
            }

            /**
             * We skip if the next node is also an import declarartion
             */
            const nextNode = sourceFileParseResults.program.body[codeBlockIndex+1];
            if (nextNode.type === "ImportDeclaration") {
                continue;
            }

            /**
             * If the top node and this node are both import declarartion
             * we extract the imports
             */
            if (!node.loc) {
                throw new Error(`Unable to locate last line of 'import' in ${sourceFile}`);
            }

            const firstNode = sourceFileParseResults.program.body[0];
            if (firstNode.type !== "ImportDeclaration" || !firstNode.loc) {
                throw new Error(`The first node in ${sourceFile} isn't an import declaration`)
            }
            sourceFileImports = extractLines(sourceFileText, firstNode.loc.start.line, node.loc.end.line);

            continue;
        }

        /**
         * We extract the policy variable name and its code
         * We then save
         */
        if (node.type === "ExportNamedDeclaration") {
            if (!node.loc) {
                throw new Error(`Unable to locate last line of 'import' in ${sourceFile}`);
            }

            if (!node.leadingComments) {
                throw new Error(`Unable to locate leading comments for export on line ${node.loc.start.line}`);
            }

            if (!node.leadingComments[0].loc) {
                throw new Error(`Unable to locate leading comment start line for export on line ${node.loc.start.line}`);
            }

            let startLine = node.leadingComments[0].loc.start.line;
            let endLine = node.loc.end.line;

            if (!node.declaration) {
                throw new Error(`Unable to find a variable declarartion for 'import' in ${node.loc.start.line}`);
            }

            if (node.declaration.type !== "VariableDeclaration") {
                throw new Error(`Unable to find a 'VariableDeclaration' for 'import' in ${node.loc.start.line}`);
            }

            if (node.declaration.declarations[0].type !== "VariableDeclarator") {
                throw new Error(`Unexpected type for 'import' in ${node.loc.start.line}`);
            }

            if (node.declaration.declarations[0].id.type !== "Identifier") {
                throw new Error(`Expecting type === Identifier but got ${node.declaration.declarations[0].id.type} for 'import' in ${node.loc.start.line}`)
            }

            extractedPolicies.push({
                policyText: extractLines(sourceFileText, startLine, endLine),
                policyVariableName: node.declaration.declarations[0].id.name,
            });
        }
    }

    const sourceDestinationDir: string = `${sourceFileDir}/${resourceName}`;

    if (!sourceFileHeader) {
        throw new Error(`Emtpy headers from ${sourceFile}`);
    }

    if (!sourceFileImports) {
        throw new Error(`No import found from ${sourceFile}`);
    }

    // foreach extractedPolicies
    for (let policyIndex = 0; policyIndex < extractedPolicies.length; policyIndex++) {
        const policyDetails: PolicyDetails = extractedPolicies[policyIndex];

        const indexFile: string = `${sourceDestinationDir}/index.ts`;
        const destinationFile: string = `${sourceDestinationDir}/${policyDetails.policyVariableName}.ts`;

        const destinationContent: string = `${sourceFileHeader}\n\n${sourceFileImports}\n\n${policyDetails.policyText}\n`;

        if (!fs.existsSync(sourceDestinationDir)) {
            fs.mkdirSync(sourceDestinationDir);
        }

        if (!fs.existsSync(destinationFile)) {
            const destinationFileHandle = fs.openSync(destinationFile, "a", 0o640);
            fs.writeFileSync(destinationFileHandle, destinationContent);
            fs.closeSync(destinationFileHandle);
        }


        if (!fs.existsSync(indexFile)) {
            const indexFileHandle = fs.openSync(indexFile, "a", 0o640);
            fs.writeFileSync(indexFileHandle, `${sourceFileHeader}\n\n`);
            fs.closeSync(indexFileHandle);
        }

        const indexFileHandle = fs.openSync(indexFile, "a", 0o640);
        fs.appendFileSync(indexFile, `export { ${policyDetails.policyVariableName} } from "./${policyDetails.policyVariableName}";\n`);
        fs.closeSync(indexFileHandle);
    }

    const specFileText: string = fs.readFileSync(specFile, "utf-8");
    const specFileDir: string = path.dirname(specFile);

    const specFileParseResults = parser.parse(specFileText, {
        attachComment: true,
        sourceType: "module",
        sourceFilename: specFile,
        plugins: [
            "typescript",
        ],
    });

    let specFileHeader: string = "";
    let specFileImports: string = "";
    let resourceFileImports : string = "";
    let specFileFunction: string = "";
    let extractedTestSuites: TestSuiteDetails[] = [];

    for (let codeBlockIndex = 0; codeBlockIndex < specFileParseResults.program.body.length; codeBlockIndex++) {
        const node = specFileParseResults.program.body[codeBlockIndex];

        if (node.type === "ImportDeclaration") {

            /**
             * We extract the specFile top headers (copyright and license)
             */
            if (specFileHeader.length === 0) {
                if (!node.loc) {
                    throw new Error(`Unable to locate last line of 'import' in ${specFile}`);
                }
                specFileHeader = extractLines(specFileText, 0, node.loc.start.line-2);
            }

            /**
             * We skip if the next node is also an import declarartion
             */
            const nextNode = specFileParseResults.program.body[codeBlockIndex+1];
            if (nextNode.type === "ImportDeclaration") {
                continue;
            }


            /**
             * If the top node and this node are both import declarartion
             * we extract the imports
             */
            if (!node.loc) {
                throw new Error(`Unable to locate last line of 'import' in ${specFile}`);
            }

            const firstNode = specFileParseResults.program.body[0];
            if (firstNode.type !== "ImportDeclaration" || !firstNode.loc) {
                throw new Error(`The first node in ${specFile} isn't an import declaration`)
            }

            /**
             * We split the imports for the .spec.ts file and the resource.ts
             * And since the files are one level lower, we also increase the relative `import`
             */
            for (let index = 0; index <= (node.loc.end.line - firstNode.loc.start.line); index++) {
                const line: string = extractLines(
                    specFileText,
                    firstNode.loc.start.line+index,
                    firstNode.loc.start.line+index)
                    .replace("\"../","\"../../");

                    if (line.length === 0) continue;

                if (line.indexOf("enums") >= 0) {
                    /**
                     * Enums may be used in both the resource and the unit test
                     * to set the correct values
                     */
                    resourceFileImports += `${line}\n`;
                    specFileImports += `${line}\n`;
                    continue;
                }

                if (line.indexOf("@pulumi/") >= 0) {
                    resourceFileImports += `${line}\n`;
                } else {
                    specFileImports += `${line.replace("createResourceValidationArgs,", "")}\n`;
                }
            }
        }

        /**
         * We extract the specFile imports and the getResourceValidationArgs() function
         */
        if (node.type === "FunctionDeclaration") {
            /**
             * If the top node is an import declarartion we extract the imports
             */
            if (!node.loc) {
                throw new Error(`Unable to locate last line of 'function' in ${specFile}`);
            }

            let startLine: number;
            let endLine: number;

            if (!node.leadingComments || !node.leadingComments[0].loc) {
                startLine = node.loc.start.line;
                endLine = node.loc.end.line;
            } else {
                startLine = node.leadingComments[0].loc.start.line;
                endLine = node.loc.end.line;
            }

            specFileFunction = extractLines(specFileText, startLine, endLine);
            continue;
        }

        /**
         * We extract each test suite
         */
        if (node.type === "ExpressionStatement") {
            if (!node.loc) {
                throw new Error(`Unable to locate last line of 'function' in ${specFile}`);
            }

            let startLine: number = node.loc.start.line;
            let endLine: number = node.loc.end.line;

            if (node.expression.type !== "CallExpression") {
                throw new Error(`Unable to locate call expressing in ${specFile}`);
            }

            if (node.expression.arguments.length !== 2 || node.expression.arguments[0].type !== "StringLiteral") {
                throw new Error(`Unable to determine test suite name in ${specFile}`);
            }

            let testSuiteName: string = node.expression.arguments[0].value;

            let brokenTestsuiteName: Array<string> = testSuiteName.split(".");
            let policyVariableName: string = brokenTestsuiteName[brokenTestsuiteName.length-1];
            let resourceName: string = brokenTestsuiteName[brokenTestsuiteName.length-2];

            extractedTestSuites.push({
                testSuiteText: extractLines(specFileText, startLine, endLine),
                testSuiteName: testSuiteName,
                testSuiteResource: resourceName,
                policyVariableName: policyVariableName,
            });
        }
    }

    const specDestinationDir: string = `${specFileDir}/${resourceName}`;

    if (!specFileHeader) {
        throw new Error(`Emtpy headers from ${specFile}`);
    }

    if (!specFileImports) {
        throw new Error(`No imports found in ${specFile}`);
    }

    if (!specFileFunction) {
        throw new Error(`No resource function found in ${specFile}`);
    }

    // for each extractedTestSuites
    for (let testSuiteIndex = 0; testSuiteIndex < extractedTestSuites.length; testSuiteIndex++) {
        const testSuiteDetails: TestSuiteDetails = extractedTestSuites[testSuiteIndex];

        const destinationSpecFile: string = `${specDestinationDir}/${testSuiteDetails.policyVariableName}.spec.ts`;
        const resourceFile: string = `${specDestinationDir}/resource.ts`;

        const destinationSpecContent: string = `${specFileHeader}\n\n${specFileImports}import \{ getResourceValidationArgs \} from "./resource";\n\n${testSuiteDetails.testSuiteText}\n`;
        const resourceContent: string = `${specFileHeader}\n\n${resourceFileImports}import \{ createResourceValidationArgs \} from "@pulumi-premium-policies/unit-test-helpers";\n\n${specFileFunction.replace("function", "export function")}\n`;

        if (!fs.existsSync(specDestinationDir)) {
            fs.mkdirSync(specDestinationDir);
        }

        if (!fs.existsSync(destinationSpecFile)) {
            const destinationSpecFileHandle = fs.openSync(destinationSpecFile, "a", 0o640);
            fs.writeFileSync(destinationSpecFileHandle, destinationSpecContent);
            fs.closeSync(destinationSpecFileHandle);
        }

        if (!fs.existsSync(resourceFile)) {
            const resourceFileHandle = fs.openSync(resourceFile, "a", 0o640);
            fs.writeFileSync(resourceFileHandle, resourceContent);
            fs.closeSync(resourceFileHandle);
        }
    }
    // FIXME:
    fs.renameSync(sourceFile, `${sourceFile}.orig`);
    // FIXME:
    fs.renameSync(specFile, `${specFile}.orig`);

}

commander.program
    .command("run")
    .description("Run the program")
    .requiredOption("--directory <directory>", "The policy vendor directory (ie, vendor-aws)")
    .requiredOption("-p, --providers <provider>,<provider>", "A comma separated list of providers to process (ie, aws,awsnative)")
    .action((options) => {

        let vendorDir: string = (options.directory as string);
        const providers: Array<string> = (options.providers as string).split(",");

        if(vendorDir.indexOf("/", vendorDir.length-1) < 0) {
            vendorDir = `${vendorDir}/`
        }

        for(let index = 0; index < providers.length; index++) {
            const provider: string = providers[index];

            if (!fs.existsSync(`${vendorDir}`)) {
                throw new Error(`Directory '${vendorDir}' must exist.`);
            }
            const files: Array<string> = findFilesByExtension(`${vendorDir}/${provider}`, ".ts");

            for (let index = 0; index < files.length; index++) {
                let sourceFile: string = files[index].replace(`${vendorDir}`, "");
                let specFile: string = "tests/" + files[index].replace(`${vendorDir}`, "").replace(".ts", ".spec.ts");

                if (!fs.existsSync(`${vendorDir}${specFile}`)) {
                    throw new Error(`Missing spec file '${specFile}' for source files '${sourceFile}'`);
                }
                cmd_run(`${vendorDir}${sourceFile}`, `${vendorDir}${specFile}`);
            }
        }
    });

commander.program.parse();
