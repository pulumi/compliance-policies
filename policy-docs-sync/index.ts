// Copyright 2016-2024, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as fs from "fs";
import * as path from "path";
import * as commander from "commander";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as parserTypes from "@babel/types";
import * as prettier from "prettier";

export interface PolicyMetadata {
    descriptionString?: string;
    vendorsString?: string;
    servicesString?: string;
    frameworksString?: string;
    severityString?: string;
    topicsString?: string;
    linkString?: string;
};

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
 * From the resourceValidationPolicy, extract the policy description.
 *
 * @param objectExpressionNode An ObjectExpression Node that contains the basic policy definition (resourceValidationPolicy).
 * @returns A string that contains the policy description.
 */
function extractPolicyDescription(resourceValidationPolicyObject: parserTypes.ObjectExpression): string {

    for(let i = 0; i < resourceValidationPolicyObject.properties.length; i++) {
        const obj = resourceValidationPolicyObject.properties[i];
        if(obj.type !== "ObjectProperty") {
            continue;
        }

        if(obj.key.type !== "Identifier") {
            continue;
        }

        if(obj.key.name !== "description") {
            continue;
        }

        if(obj.value.type !== "StringLiteral") {
            throw new Error("Property 'description' is not a 'string' as expected.");
        }

        return obj.value.value;
    }
    throw new Error("Unable to find property 'description'.");
}

/**
 * From an ArrayExpression object, returns a string of the values.
 *
 * @param arrayExpressionObject The ArrayExpression containing the multiple strings.
 * @returns A string representing the values of the provided ArrayExpression, or "none" is there was no values.
 */
function extractArrayToString(arrayExpressionObject: parserTypes.ArrayExpression): string {

    const items: string[] = [];

    for(let i = 0; i < arrayExpressionObject.elements.length; i++) {
        const element = arrayExpressionObject.elements[i];

        if(!element || element.type !== "StringLiteral") {
            continue;
        }
        items.push(element.value.toLowerCase());
    }

    return items.sort().join(", ").toLowerCase();
}

/**
 * Reads the comments set above the policy and return the link for this policy as located after @link.
 *
 * @param policyLeadingComments An array of comments. Only the last one is used as it's the one shown by Intellisense.
 * @returns A string containing a hyperlink for the provided policy, or "none" is there's no value.
 */
function extractPolicyLink(policyLeadingComments?: parserTypes.Comment[] | null ): string {

    if(!policyLeadingComments || policyLeadingComments.length < 1) {
        return "none";
    }
    const lastComment: parserTypes.Comment = policyLeadingComments[policyLeadingComments.length-1];

    const result = lastComment.value.match(/\* ?@link (.*)$/m);
    if(!result) {
        return "none";
    }
    return result[1];
}

/**
 * Reads the policy metadata and generates a formatted policy comments.
 *
 * @param policyMetadata The policy metadata to use to generate the policy comment.
 * @returns A string that contains the formatted policy comment.
 */
function generatePolicyComment(policyMetadata: PolicyMetadata): string {
    return `*
 * ${policyMetadata.descriptionString}
 *
 * @severity ${policyMetadata.severityString || "none"}
 * @frameworks ${policyMetadata.frameworksString || "none"}
 * @topics ${policyMetadata.topicsString || "none"}
 * @link ${policyMetadata.linkString || "none"}
 `;
}

/**
 * Entrypoint to the `run` command.
 *
 * @param vendorDir Policy vendor directory.
 * @param providerName Pulumi provider name to process.
 */
function cmd_run(vendorDir: string, providerName: string) {

    const sourceFiles: Array<string> = findFilesByExtension(`${vendorDir}/${providerName}`, ".ts").sort();

    for(let i = 0; i < sourceFiles.length; i++) {


        const sourceFile: string = sourceFiles[i];
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

        const policyMetadata: PolicyMetadata = {};

        try {
            traverse(sourceFileParseResults, {
                ExportNamedDeclaration: exportNamedDeclarationNode => {

                    policyMetadata.linkString = extractPolicyLink(exportNamedDeclarationNode.node.leadingComments);

                    traverse(exportNamedDeclarationNode.node, {
                        VariableDeclaration: variableDeclarationNode => {

                            traverse(variableDeclarationNode.node, {
                                CallExpression: callExpressionNode => {

                                    traverse(callExpressionNode.node, {
                                        ObjectExpression: objectExpressionNode => {

                                            for(let x = 0; x < objectExpressionNode.node.properties.length; x++) {
                                                const obj = objectExpressionNode.node.properties[x];
                                                if (obj.type !== "ObjectProperty") {
                                                    continue;
                                                }

                                                if(obj.value.type !== "ArrayExpression" && obj.value.type !== "StringLiteral" && obj.value.type !== "ObjectExpression") {
                                                    continue;
                                                }

                                                if(obj.key.type !== "Identifier") {
                                                    continue;
                                                }

                                                switch(obj.key.name) {
                                                    case "resourceValidationPolicy":
                                                        if (obj.value.type === "ObjectExpression") {
                                                            policyMetadata.descriptionString = extractPolicyDescription(obj.value);
                                                        } else {
                                                            throw new Error(`Expecting an 'ObjectExpression' for '${obj.key.name}'.`);
                                                        }
                                                        break;
                                                    case "severity":
                                                        if(obj.value.type !== "StringLiteral") {
                                                            throw new Error(`Expecting a 'StringLiteral' for '${obj.key.name}'.`);
                                                        }
                                                        policyMetadata.severityString = obj.value.value.toLowerCase();
                                                        break;
                                                    case "vendors":
                                                        if(obj.value.type !== "ArrayExpression") {
                                                            throw new Error(`Expecting an 'ArrayExpression' for '${obj.key.name}'.`);
                                                        }
                                                        policyMetadata.vendorsString = extractArrayToString(obj.value);
                                                        break;
                                                    case "services":
                                                        if(obj.value.type !== "ArrayExpression") {
                                                            throw new Error(`Expecting an 'ArrayExpression' for '${obj.key.name}'.`);
                                                        }
                                                        policyMetadata.servicesString = extractArrayToString(obj.value);
                                                        break;
                                                    case "topics":
                                                        if(obj.value.type !== "ArrayExpression") {
                                                            throw new Error(`Expecting an 'ArrayExpression' for '${obj.key.name}'.`);
                                                        }
                                                        policyMetadata.topicsString = extractArrayToString(obj.value);
                                                        break;
                                                    case "frameworks":
                                                        if(obj.value.type !== "ArrayExpression") {
                                                            throw new Error(`Expecting an 'ArrayExpression' for '${obj.key.name}'.`);
                                                        }
                                                        policyMetadata.frameworksString = extractArrayToString(obj.value);
                                                        break;
                                                    default:
                                                        throw new Error(`unsupported property '${obj.key.name}'`);
                                                }
                                            }
                                            objectExpressionNode.stop();
                                        },
                                    }, callExpressionNode.scope);
                                },
                            }, variableDeclarationNode.scope);
                        },
                    }, exportNamedDeclarationNode.scope);
                },
            });

        } catch(e) {
            console.log(`An error occurred while processing ${sourceFile}. Error: ${(e as Error).message}`);
            continue;
        }



        traverse(sourceFileParseResults, {
            ExportNamedDeclaration: exportNamedDeclarationNode => {
                const policyComment = generatePolicyComment(policyMetadata);

                if(!exportNamedDeclarationNode.node.leadingComments) {
                    // console.log("add new comment");
                    exportNamedDeclarationNode.addComment("leading", policyComment);
                    return;
                }
                if(exportNamedDeclarationNode.node.leadingComments.length > 0) {
                    /**
                     * Replace only the last comment and leave the others unchanged.
                     * Only the last comment is used by Intellisense.
                     */
                    exportNamedDeclarationNode.node.leadingComments[exportNamedDeclarationNode.node.leadingComments.length-1].value = policyComment;
                }
            },
        });

        const output = generate(sourceFileParseResults);
        const sourceCode: string = prettier.format(output.code.replace(/;\n\/\*\*/m, ";\n\n/**"), {
            tabWidth: 4,
            printWidth: 200,
            proseWrap: "preserve",
            quoteProps: "preserve",
            parser: "babel",
        });

        const fd = fs.openSync(sourceFile, "w");
        fs.writeFileSync(fd, sourceCode);
        fs.closeSync(fd);
    }


}

commander.program
    .command("run")
    .description("Run the program")
    .requiredOption("--directory <directory>", "The policy vendor directory (ie, ../vendor-aws)")
    .requiredOption("-p, --providers <provider>,<provider>", "A comma separated list of providers to process (ie, aws,awsnative or azure,azurenative)")
    .action((options) => {

        const providers: Array<string> = (options.providers as string).split(",");
        for(let i = 0; i < providers.length; i++) {
            cmd_run((options.directory as string), providers[i]);
        }

    });

commander.program.parse();
