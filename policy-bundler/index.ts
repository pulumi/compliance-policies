// Copyright 2016-2022, Pulumi Corporation.
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

import * as fs from "fs";
import * as path from "path";
import * as commander from "commander";
import * as eta from "eta";
import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as parserTypes from "@babel/types";
import * as generator from "@babel/generator";
import * as prettier from "prettier";

interface Source {
    /**
     * An array of non default `import` statements in relation to the policy.
     */
    imports: string[];
    /**
     * The policy source code.
     */
    policy: string;
};

interface PolicyCode {
    /**
     * The policy variable name.
     */
    name: string;
    /**
     * Path to the policy file.
     */
    path: string;
    /**
     * The policy raw source.
     */
    rawSourceCode: Source;
    /**
     * The policy updated source code.
     */
    sourceCode: Source;
};

interface Resource {
    /**
     * The resource Name.
     */
    name: string;
    /**
     * Policies for the current resource.
     */
    policies: PolicyCode[];
};

interface Bundle {
    /**
     * Path to the bundle point.
     */
    path: string;
    /**
     * List of resources.
     */
    resources: Resource[];
};

interface GenericImports {
    [key: string]: string[];
}

const apiVersionPatterns: RegExp[] = [
    /v\d{1}((alpha|beta)\d)?/,                              // kubernetes (`v1`, `v1alpha1`, `v1beta2`)
    /v\d{8}(preview|privatepreview)?/,                      // azure (`v20190505`, `v20190505preview`, `v20181102privatepreview`)
    /(v\d{1}((alpha|beta)\d?)|(v\d{1})|(alpha)|(beta))/,    // google (`v1alpha1`, `v1beta`, `v2`, `alpha`, `beta`)
];

const genericImports: GenericImports = {
    "@pulumi/policy": [
        "ResourceValidationPolicy",
        "validateResourceOfType",
    ],
    "@pulumi-premium-policies/policy-manager": [
        "policyManager",
    ],
};

/**
 * Recursively remove a given directory.
 *
 * @param directoryPath The directory to remove.
 */
function rmdirSync(directoryPath: string): void {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file) => {
            const currentPath = path.join(directoryPath, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                rmdirSync(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });

        fs.rmdirSync(directoryPath);
    }
}

/**
 * Recursively create the specified directory.
 *
 * @param directoryPath Directory to create.
 */
function mkdirpSync(directoryPath: string): void {

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
 * This function scans a given directory for files with a matching extensions and returns the results as an array.
 *
 * @param directory A path to an existing directory to find files in.
 * @param extension The desired file extension to look for.
 * @returns An array of files.
 */
function findFilesByExtension(directory: string, extension: string): string[] {
    const files: string[] = [];

    const dirContent = fs.readdirSync(directory);

    for (let index = 0; index < dirContent.length; index++) {
        const file = dirContent[index];
        const fullPath = path.join(directory, file);

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

/**
 * Find all directories recursively.
 *
 * @param folderPath Directory search starting point.
 * @returns An array of directories.
 */
function getDirectories(folderPath: string): string[] {

    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const directories: string[] = [];

    entries.forEach((entry) => {
        const fullPath = `${folderPath}/${entry.name}`;
        if (entry.isDirectory()) {
            directories.push(fullPath);
            directories.push(...getDirectories(fullPath));
        }
    });

    return directories;
}

/**
 * Determine if the provided `folderPath` contains an API version in it.
 *
 * @param folderPath A directory path name to check.
 * @returns `true` is the path name contains an API version in it, otherwise false. The index for the match is also returned, otherwise -1.
 */
function hasApiVersion(folderPath: string): [boolean, number] {

    for (let x = 0; x < apiVersionPatterns.length; x++) {
        const result = RegExp(apiVersionPatterns[x]).exec(folderPath);
        if (result && result[0] !== undefined) {
            return [true, result.index];
        }

    }
    return [false, -1];
}

/**
 * This function scans a given directory to find directories that can be used to store bundled policies.
 *
 * @param vendorDir The policy vendor directory.
 * @param provider The provider's directory containing the policies.
 * @returns An array of paths to bundle policies into.
 */
function findProviderBundlePoints(vendorDir: string, provider: string): string[] {

    const searchBase: string = `${vendorDir}/${provider}`;

    const dirs = getDirectories(searchBase);
    const bundleDirs: string[] = [];

    dirs.forEach((dir) => {
        dir = dir.replace(searchBase, provider);

        const [hasApi, apiIndex] = hasApiVersion(dir);

        if (hasApi) {
            if (dir.indexOf("/", apiIndex) === -1 ) {
                /**
                 * The value of `dir` doesn't contain any trailing resource name.
                 * So, this is a bundle point.
                 */
                bundleDirs.push(dir);
            }
            return;
        }

        // some providers have versionless resources that need to be bundled
        // directly under the service.
        if (dir.indexOf("/", provider.length + 1) === -1) {
            bundleDirs.push(dir);
        }
    });

    return bundleDirs.sort();
}

/**
 * Bundle policies found in the provided `bundlePoint` as long as the
 * `bundlePoint` doesn't have any directories that host an API version.
 *
 * @param vendorDir Policy vendor directory.
 * @param bundlePoint A path to start bundling policies into.
 * @returns The number of bundled policies.
 */
function createPolicyBundle(vendorDir: string, bundlePoint: string, bundleDirectory: string): number {

    const searchBase: string = `${vendorDir}/${bundlePoint}`;

    const dirs: string[] = [];

    getDirectories(searchBase).forEach((dir) => {
        const d: string = dir.replace(searchBase, "");

        const [result, index] = hasApiVersion(d);
        if (!result) {
            /**
             * We avoid including paths that contain an API version.
             * This is because the Azure Native provider has default APIs
             * inside of which there are versioned ones too.
             */
            dirs.push(dir);
        }
    });

    // if (bundlePoint.indexOf("googlenative/iap") >= 0 ) {
    //     console.log(`vendorDir: ${vendorDir}, bundlePoint: ${bundlePoint}`);
    //     console.log(dirs);
    // }

    const point: Bundle = {
        path: bundlePoint,
        resources: [],
    };

    dirs.forEach((dir) => {
        const policyFiles: string[] = findFilesByExtension(dir, ".ts").sort();
        const resource: Resource = {
            name: path.basename(dir),
            policies: [],
        };
        policyFiles.forEach((policyFile) => {
            resource.policies.push(getPolicyCode(policyFile));
        });
        point.resources.push(resource);
    });

    const bundleTemplateFunction = eta.loadFile("templates/policy-bundle.eta", {
        filename: "templates/policy-bundle.eta",
    });

    const collatedImports: string[] = [];
    let sourceCode: string = "";
    let policycount: number = 0;

    point.resources.forEach((resource) => {

        sourceCode += `namespace ${path.basename(resource.name)} {\n`;
        resource.policies.forEach((policy) => {
            policycount++;
            sourceCode += policy.sourceCode.policy + "\n";
            collatedImports.push(...policy.sourceCode.imports);
        });
        /**
         * The `export` statement is separate so that when vscode prompts for code
         * completion, it doesn't use the namespace icon "{ }" and instead the object
         * one.
         * This is done to ensure a consistent visual experience when navigating the
         * policies. This also aligns with services and resources within providers.
         */
        sourceCode += `};\nexport { ${path.basename(resource.name)} };\n\n`;
    });

    const bundleTemplateArgs = {
        imports: Array.from(new Set(collatedImports)),
        sourceCode: sourceCode,
    };

    const bundledCode: string = prettier.format(eta.render(bundleTemplateFunction, bundleTemplateArgs).replace(/;\n\/\*\*/m, ";\n\n/**"), {
        tabWidth: 4,
        printWidth: 200,
        proseWrap: "preserve",
        quoteProps: "preserve",
        parser: "typescript",   // using `babel` here seems to cause issues.
    });

    /**
     * We only create an `index.ts` if we have policies that have been bundled.
     */
    if (collatedImports.length > 0) {
        mkdirpSync(`${bundleDirectory}/${point.path}`);
        const exportsFileHandle = fs.openSync(`${bundleDirectory}/${point.path}/index.ts`, "w", 0o640);
        fs.appendFileSync(exportsFileHandle, bundledCode);
        fs.closeSync(exportsFileHandle);
    }

    return policycount;
}

/**
 * Extract information about a given policy source file.
 *
 * @param policyFile Path to a policy source file.
 * @returns A populated `PolicyCode` object.
 */
function getPolicyCode(policyFile: string): PolicyCode {

    const policyFileText: string = fs.readFileSync(policyFile, "utf-8");
    const policyFileParseResults = parser.parse(policyFileText, {
        attachComment: true,
        sourceType: "module",
        sourceFilename: policyFile,
        plugins: [
            "typescript",
        ],
    });

    let policyName: string = "";
    let policySourceCode: string = "";
    let resourceType: string = "";
    const policyImports: string[] = [];

    if (!policyFileParseResults) {
        console.log(`policyFile: Unable to parse ${policyFile}`);
    }

    traverse(policyFileParseResults, {
        ExportNamedDeclaration: exportNamedDeclarationNode => {
            [policyName, policySourceCode] = extractPolicyCode(policyFileText, exportNamedDeclarationNode.node);
        },
        ImportDeclaration: importDeclarationNode => {
            const importStatements: string[] = extractPolicyCodeImports(policyFileText, importDeclarationNode);
            if (!importStatements) {
                return;
            }
            policyImports.push(...importStatements);
        },
        CallExpression: callExpressionNode => {

            /**
             * Check that the node we are receiving is `validateResourceOfType()`.
             */
            if (callExpressionNode.node.callee.type !== "Identifier") {
                return;
            }
            if (callExpressionNode.node.callee.name !== "validateResourceOfType") {
                return;
            }

            if (callExpressionNode.node.arguments.length === 0) {
                return;
            }
            if (callExpressionNode.node.arguments[0].type === "Identifier") {
                /**
                 * We have a short notation. Like `Instance` or `Disk`.
                 */
                resourceType = callExpressionNode.node.arguments[0].name;
            } else if (callExpressionNode.node.arguments[0].type === "MemberExpression") {
                /**
                 * We have a full notation. Like `aws.ec2.Instance` or `azure.compute.Disk`.
                 */
                if (!callExpressionNode.node.arguments[0].loc) {
                    throw new Error("Failed to extract resource type.");
                }
                const result = extractTextFromCode(
                    policyFileText,
                    callExpressionNode.node.arguments[0].loc.start.line,
                    callExpressionNode.node.arguments[0].loc.end.line,
                    callExpressionNode.node.arguments[0].loc.start.column,
                    callExpressionNode.node.arguments[0].loc.end.column,
                );
                if (!result) {
                    throw new Error("Failed to extract resource type.");
                }
                resourceType = result;

            }
        },
    });

    return {
        name: policyName,
        path: policyFile,
        rawSourceCode: {
            imports: policyImports,
            policy: policySourceCode,
        },
        sourceCode: updateSourceCode(resourceType, {
            imports: policyImports,
            policy: policySourceCode,
        }),
    };
}

/**
 * This function updates the `import` statement and this resource type for the policy so it can be safely used in a namespace.
 *
 * @param resourceType A string representing the resource type.
 * @param source The raw `Source` for the policy.
 * @returns An updated `Source` for the policy to be embedded into a namespace.
 */
function updateSourceCode(resourceType: string, source: Source): Source {

    const updatedSource: Source = {
        imports: [],
        policy: "",
    };

    const policyFileParseResults = parser.parse(source.policy, {
        attachComment: true,
        sourceType: "module",
        sourceFilename: "",
        plugins: [
            "typescript",
        ],
    });

    if (!policyFileParseResults) {
        throw new Error(`policyFile: Unable to parse.`);
    }

    const resourceTypeElements: string[] = resourceType.split(".");
    if (resourceTypeElements.length === 1) {

        /**
         * Update import statements.
         */
        for (let i = 0; i < source.imports.length; i++) {
            if (isProviderImport(source.imports[i])) {

                traverse(policyFileParseResults, {
                    Identifier: identifierNode => {
                        if (identifierNode.node.name === resourceTypeElements[0]) {
                            identifierNode.node.name = `_${identifierNode.node.name}`;
                        }
                    },
                });

                const result = source.imports[i].replace(resourceTypeElements[0], `${resourceTypeElements[0]} as _${resourceTypeElements[0]}`);
                updatedSource.imports.push(result);
            } else {
                updatedSource.imports.push(source.imports[i]);
            }
        }

    } else {
        /**
         * Update import statements.
         */
        for (let i = 0; i < source.imports.length; i++) {
            if (isProviderImport(source.imports[i])) {

                traverse(policyFileParseResults, {
                    Identifier: identifierNode => {
                        if (identifierNode.node.name === resourceTypeElements[0]) {
                            // console.log(`identifier: ${identifierNode.node.name}`);
                            identifierNode.node.name = `_${identifierNode.node.name}`;
                        }
                    },
                });


                const result = source.imports[i].replace(`as ${resourceTypeElements[0]}`, `as _${resourceTypeElements[0]}`);
                updatedSource.imports.push(result);
            } else {
                updatedSource.imports.push(source.imports[i]);
            }
        }
    }

    const generatedCode = generator.default(policyFileParseResults);
    if (!generatedCode.code) {
        throw new Error(`Failed to generate updated code.`);
    }
    updatedSource.policy = generatedCode.code;

    return updatedSource;
}

/**
 * Check if the supplied import statement uses a provider import.
 *
 * @param importStatement An actual `import` statement provided as a string.
 * @returns Returns `true` is the import relates to a provider. Otherwise `false`.
 */
function isProviderImport(importStatement: string): boolean {

    const r1 = new RegExp(/from ["'](@pulumi\/policy|@pulumi-premium-policies\/.*)/, "m").exec(importStatement);
    if (r1 && r1[0]) {
        return false;
    }
    return true;
}

/**
 * Extract a portion of a file content.
 *
 * @param sourceCode The source code to extract lines from.
 * @param startLine The start line.
 * @param endLine The end line.
 * @param startChar The 1st character position to return. Implies `startLine` === `endLine`.
 * @param endChar The last character position to return. Implies `startLine` === `endLine`.
 * @returns A string that contains the extracted portion of the `sourceCode`.
 */
function extractTextFromCode(sourceCode: string, startLine: number, endLine: number, startChar?: number, endChar?: number): string | null {
    const lines = sourceCode.split("\n");
    const start = Math.max(0, startLine - 1);
    const end = Math.min(lines.length, endLine);

    if (start > end) {
        return null;
    }
    const extractedLines = lines.slice(start, end);

    if (startLine === endLine) {
        return extractedLines.join("\n").slice(startChar, endChar);
    }
    return extractedLines.join("\n");
}

/**
 * This function returns the policy specific import statements in an array.
 *
 * @param policySourceCode The policy source code as a string.
 * @param importObject An ImportDeclaration representing the parsed import statement.
 * @returns The import statement as a string line string.
 */
function extractPolicyCodeImports(policySourceCode: string, importObject: NodePath<parserTypes.ImportDeclaration>): string[] {

    const importObjectNode: parserTypes.ImportDeclaration = importObject.node;
    if (!importObjectNode.loc) {
        throw new Error("The import statement doesn't have a code location");
    }

    const importStartLine: number = importObjectNode.loc.start.line;
    const importEndLine: number = importObjectNode.loc.end.line;

    const importStatements: string[] = [];

    traverse(importObjectNode, {
        ImportNamespaceSpecifier: importNamespaceSpecifierNode => {
            const result2: string | null = extractTextFromCode(policySourceCode, importStartLine, importEndLine);

            if (!result2) {
                throw new Error("Failed to extract import source code");
            }
            importStatements.push(result2);
        },
        ImportSpecifier: importSpecifierNode => {
            if (importSpecifierNode.node.imported.type === "Identifier") {
                importStatements.push(`import { ${importSpecifierNode.node.imported.name} } from "${importObjectNode.source.value}";`);
            }
        },
    }, importObject.scope);

    // const genericImportsKeys: string[] = Object.keys(genericImports);

    // for (let x = 0; x < genericImportsKeys.length; x++) {
    //     const genericImportName: string = genericImportsKeys[x];
    //     const importedElements: string[] = genericImports[genericImportName];

    //     if (importObjectNode.source.value.indexOf(genericImportName) !== -1) {

    //         traverse(importObjectNode, {
    //             ImportNamespaceSpecifier: importNamespaceSpecifierNode => {
    //                 const result2: string | null = extractTextFromCode(policySourceCode, importStartLine, importEndLine);

    //                 if (!result2) {
    //                     throw new Error("Failed to extract import source code");
    //                 }
    //                 importStatements.push(result2);
    //             },
    //             ImportSpecifier: importSpecifierNode => {
    //                 if (importSpecifierNode.node.imported.type === "Identifier") {
    //                     importStatements.push(`import { ${importSpecifierNode.node.imported.name} } from "${importObjectNode.source.value}";`);
    //                 }
    //             },
    //         }, importObject.scope);
    //     }
    // }

    // /**
    //  * Copy the import statement as-is.
    //  */
    // if (importStatements.length === 0) {

    //     const result2: string | null = extractTextFromCode(policySourceCode, importStartLine, importEndLine);
    //     if (!result2) {
    //         throw new Error("Failed to extract import source code");
    //     }
    //     importStatements.push(result2);
    // }

    return importStatements;
}

/**
 * This function returns the policy variable name and its raw source code, including leading comment block.
 *
 * @param policySourceCode The policy source code as a string.
 * @param policyObject A ExportNamedDeclaration representing the parsed policy code.
 * @returns As an array, the policy variable name and its source code.
 */
function extractPolicyCode(policySourceCode: string, policyObject: parserTypes.ExportNamedDeclaration): [string, string] {

    if (!policyObject.leadingComments || !policyObject.leadingComments[0] || policyObject.leadingComments[0].type !== "CommentBlock" || !policyObject.leadingComments[0].loc) {
        throw new Error("Policy doesn't any valid leading comment block");
    }
    if (!policyObject.loc) {
        throw new Error("Failed to parse policy.");
    }

    if (!policyObject.declaration || policyObject.declaration.type !== "VariableDeclaration" || policyObject.declaration.declarations[0].id.type !== "Identifier") {
        throw new Error("The policy is not a variable declaration.");
    }

    const policyStartLine: number = policyObject.leadingComments[0].loc.start.line;
    const policyEndLine: number = policyObject.loc.end.line;
    const policyVariableName: string = policyObject.declaration.declarations[0].id.name;
    const policyCode: string | null= extractTextFromCode(policySourceCode, policyStartLine, policyEndLine);

    if (!policyCode) {
        throw new Error("Failed to extract policy source code.");
    }

    return [policyVariableName, policyCode];
}

/**
 * Create or update `index.ts` to link all bundle points together.
 *
 * @param bundleDirectory The base location where bundled policies are located.
 * @param bundlePoints For a given provider, a list of bundle directories.
 */
function stitchBundlePoints(bundleDirectory: string, bundlePoints: string[]) {
    bundlePoints.forEach((bundlePoint) => {

        // if (bundlePoint.indexOf("/compute") === -1) {
        //     return;
        // }

        const subDirs: string[] = getDirectories(`${bundleDirectory}/${bundlePoint}`);
        const bundleExports: string[] = [];

        subDirs.forEach((subDir) => {

            const subPoint: string = subDir.replace(`${bundleDirectory}/`, "");
            if (bundlePoints.includes(subPoint)) {
                const baseDir: string = path.basename(subPoint);
                bundleExports.push(`export * as ${baseDir} from "./${baseDir}";`);

            }
        });

        let bundledExportsCode: string = "";
        if (!fs.existsSync(`${bundleDirectory}/${bundlePoint}/index.ts`)) {
            /**
             * Generate a new `index.ts`.
             */

            const indexTemplateFunction = eta.loadFile("templates/index.eta", {
                filename: "templates/index.eta",
            });
            const indexTemplateArgs = {
                exports: bundleExports,
            };

            bundledExportsCode = prettier.format(eta.render(indexTemplateFunction, indexTemplateArgs).replace(/;\n\/\*\*/m, ";\n\n/**"), {
                tabWidth: 4,
                printWidth: 200,
                proseWrap: "preserve",
                quoteProps: "preserve",
                parser: "typescript",   // using `babel` here seems to cause issues.
            });
        } else {
            /**
             * Simply patch up the existing `index.ts`.
             */
            bundledExportsCode += "\n";
            bundleExports.forEach((bundleExport) => {
                bundledExportsCode += `${bundleExport}\n`;
            });

        }

        const indexFileHandle = fs.openSync(`${bundleDirectory}/${bundlePoint}/index.ts`, "a+", 0o640);
        fs.appendFileSync(indexFileHandle, bundledExportsCode);
        fs.closeSync(indexFileHandle);

    });
    return;
}

/**
 * Create the missing `index.ts` at the top of the provider directory.
 *
 * @param vendorDir Policy vendor directory.
 * @param providerDir Policy provider directory relative to `vendorDir`.
 * @param bundleDirectory The bundle's destination folder.
 */
function createProviderIndex(vendorDir: string, providerDir: string, bundleDirectory: string) {
    /**
     * Find all directories
     * Create export sttements
     * create `index.ts`.
     */

    const folderPath: string = `${vendorDir}/${providerDir}`;
    const providerBundlePath: string = `${bundleDirectory}/${providerDir}`;
    const providerExports: string[] = [];

    const entries = fs.readdirSync(folderPath, { withFileTypes: true });

    entries.forEach((entry) => {
        if (entry.isDirectory()) {
            providerExports.push(`export * as ${entry.name} from "./${entry.name}";`);
        }
    });

    // console.log(providerExports);

    const indexTemplateFunction = eta.loadFile("templates/index.eta", {
        filename: "templates/index.eta",
    });
    const indexTemplateArgs = {
        exports: providerExports,
    };

    const bundledExportsCode = prettier.format(eta.render(indexTemplateFunction, indexTemplateArgs).replace(/;\n\/\*\*/m, ";\n\n/**"), {
        tabWidth: 4,
        printWidth: 200,
        proseWrap: "preserve",
        quoteProps: "preserve",
        parser: "typescript",   // using `babel` here seems to cause issues.
    });

    const indexFileHandle = fs.openSync(`${providerBundlePath}/index.ts`, "wx", 0o640);
    fs.appendFileSync(indexFileHandle, bundledExportsCode);
    fs.closeSync(indexFileHandle);
}

/**
 * Entrypoint to the `run` command.
 *
 * @param vendorDir Policy vendor directory.
 * @param providers An array of provider directory as found in vendorDir.
 * @param bundleDirectory The bundle's destination folder.
 */
function cmd_run(vendorDir: string, providers: string[], bundleDirectory: string) {

    rmdirSync(bundleDirectory);

    eta.configure({
        autoTrim: [false, false],
        views: path.resolve(`${__dirname}/templates`),
    });

    for(let providerIndex = 0; providerIndex < providers.length; providerIndex++) {
        const providerDir: string = providers[providerIndex];
        const bundlePoints: string[] = findProviderBundlePoints(vendorDir, providerDir);

        for (let bundlePointIndex = 0; bundlePointIndex < bundlePoints.length; bundlePointIndex++) {
            const policyCount: number = createPolicyBundle(vendorDir, bundlePoints[bundlePointIndex], bundleDirectory);
        }

        stitchBundlePoints(bundleDirectory, bundlePoints);
        createProviderIndex(vendorDir, providerDir, bundleDirectory);
        fs.copyFileSync(`${vendorDir}/index.ts`, `${bundleDirectory}/index.ts`);
        fs.copyFileSync(`${vendorDir}/version.ts`, `${bundleDirectory}/version.ts`);
        fs.copyFileSync(`${vendorDir}/package.json`, `${bundleDirectory}/package.json`);
        fs.copyFileSync(`${vendorDir}/tsconfig.json`, `${bundleDirectory}/tsconfig.json`);
    }

    return;
}

commander.program
    .command("run")
    .description("Run the program")
    .requiredOption("--vendor-directory <directory>", "The policy vendor directory (ie, ../vendor-aws)")
    .requiredOption("--providers <provider>,<provider>", "A comma separated list of providers to process (ie, aws,awsnative or azure,azurenative)")
    .requiredOption("--bundle-directory <directory>", "The policy vendor directory (ie, ../vendor-aws)")
    .action((options) => {

        options.vendorDirectory = (options.vendorDirectory as string).replace(/\/$/, "");
        options.providers = (options.providers as string).split(",");
        cmd_run(options.vendorDirectory, options.providers, (options.bundleDirectory as string));
    });

commander.program.parse();
