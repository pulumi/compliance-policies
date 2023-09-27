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

import * as fs from "fs";
import * as path from "path";
import * as commander from "commander";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as parserTypes from "@babel/types";
import { Eta } from "eta";

interface VendorInfo {
    name: string;
    path: string;
    providersPath: string[];
}

interface JsDocTag {
    name: string,
    value: string,
    // [tagName: string]: string,
}

interface PolicyJsDoc {
    name: string,
    description: string,
    file: string,
    codePath: string,
    service: string,
    resource: string,
    jsDocTags: JsDocTag[],
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
            if (file === "node_modules" || file === "bin" || file === "build") {
                continue;
            }
            files.push(...findFilesByExtension(fullPath, extension));
        } else if (path.extname(file) === extension) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Crudely converts a policy file path into code returned as a string
 * to be included in a documentation.
 *
 * @param inputFile a path to a policy file.
 * @param basePath the base search path for the vendor
 * @returns a policy code path as a string
 */
function getPolicyCodePath(inputFile: string, basePath: string): string {
    const relativeInputFile: string = inputFile.replace(basePath, "");
    return relativeInputFile.replace(/\.ts$/g, "").replace(/^\//, "").replaceAll("/", ".");
}

/**
 * This function returns the policy name for the given objet expression.
 *
 * @param resourceValidationPolicyObject a parsed object expression.
 * @returns The policy name.
 */
function getPolicyName(resourceValidationPolicyObject: parserTypes.ObjectExpression): string {
    for(let i = 0; i < resourceValidationPolicyObject.properties.length; i++) {
        const obj = resourceValidationPolicyObject.properties[i];
        if(obj.type !== "ObjectProperty") {
            continue;
        }

        if(obj.key.type !== "Identifier") {
            continue;
        }

        if(obj.key.name !== "name") {
            continue;
        }

        if(obj.value.type !== "StringLiteral") {
            throw new Error("Property 'name' is not a 'string' as expected.");
        }

        return obj.value.value;
    }
    throw new Error("Unable to find property 'name'.");

}

/**
 * Returns the associated comment for the provided tag name.
 *
 * @param name the @tag to look for.
 * @param comment the raw JsDoc comment to parse.
 * @returns the comment for the provided tag, or `undefined` if the tag is not present.
 */
function getJsDocTag(name: string, comment: string): JsDocTag | undefined {

    const re = new RegExp(`.*\\* @${name.toLowerCase()} (.*)`, "gm");
    const value = re.exec(comment);

    if ( value && value.at(1) ) {
        return {
            name: name,
            value: value.at(1)!,
        }
    } else {
        return undefined;
    }
}

/**
 * Returns the JsDoc description present in the provided raw JsDoc.
 *
 * @param comment the raw JsDoc comment to parse.
 * @returns the JsDoc description.
 */
function getJsDocDescription(comment: string): string {
    let jsDocDescription: string = "";
    const results = [...comment.matchAll(/^ \* (?!@\w* )(.*)$/gm)];

    if (!results) {
        throw new Error(`policyFile: Unable to find policy description.`);
    }

    results?.forEach(result => {
        if (jsDocDescription === "") {
            jsDocDescription = result[1];
        } else {
            jsDocDescription = `${jsDocDescription} ${result[1]}`;
        }
    });
    return jsDocDescription;
}

/**
 * Program entrypoint to generate policies documentation.
 *
 * @param vendorName Name of of the cloud vendor (ie, `aws` for `vendor-aws`)
 * @param vendorDir Directory where the vendor's policies are stored. (ie, `../vendor-aws`)
 * @param providers A coma separated list of provider directories where the policies are stored. (ie, `aws,awsnative`)
 * @param destinationDir A directory where to save the generated markdown documents. Usually pulumi-hugo)
 */
function cmd_vendor(vendorName: string, vendorDir: string, providers: string[], destinationDir: string) {
    const eta = new Eta({
        autoTrim: [false, false],
        cache: false,
        views: path.join(__dirname, "templates")
    });

    const vendorInfo: VendorInfo = {
        name: vendorName,
        path: vendorDir,
        providersPath: providers
    };

    for (let x = 0; x < providers.length; x++) {
        const provider: string = providers[x];
        const basePath: string = `${vendorInfo.path}/${provider}`;
        const inputFiles: string[] = findFilesByExtension(basePath, ".ts").sort().filter((element) => element.indexOf("index.ts") == -1 );

        let providerMarkdown: string = eta.render("provider-summary", {
            vendor: vendorInfo.name,
            provider: provider,
            policyCount: inputFiles.length,
        });

        let previousService: string = "";
        let previousResource: string = "";

        for (let y = 0; y < inputFiles.length; y++) {
            const policyFile: string = inputFiles[y];

            const policyCodePath: string = `${getPolicyCodePath(policyFile, vendorInfo.path)}`;
            const policyFileText: string = fs.readFileSync(policyFile, "utf-8");

            const policyFileParseResults = parser.parse(policyFileText, {
                attachComment: true,
                sourceType: "module",
                sourceFilename: policyFile,
                plugins: [
                    "typescript"
                ],
            });

            if (!policyFileParseResults) {
                throw new Error(`policyFile: Unable to parse ${policyFile}.`);
            }

            let policyJsDoc: PolicyJsDoc = {
                name: "",
                description: "",
                file: policyFile,
                codePath: policyCodePath,
                jsDocTags: [],
                service: policyCodePath.split(".")[1],
                resource: policyCodePath.split(".")[2],
            };

            traverse(policyFileParseResults, {
                ExportNamedDeclaration: exportNamedDeclarationNode => {
                    /**
                     * 🌿 it would be great to parse the code metadata and automatically
                     * detect the @tag in the comments.
                     */
                    if (!exportNamedDeclarationNode.node.leadingComments) {
                        throw new Error(`policyFile: Unable to find policy comments in ${policyFile}.`);
                    }

                    const jsDocComments = exportNamedDeclarationNode.node.leadingComments.filter(comment => comment.type === "CommentBlock");
                    if (jsDocComments.length === 0 || jsDocComments.length > 1) {
                        throw new Error(`policyFile: 0 or more than 1 JsDoc commend found in ${policyFile}.`);
                    }

                    const jsDocComment: string = jsDocComments[0].value;
                    if (!jsDocComment) {
                        throw new Error(`policyFile: emtpy JsDoc comment found in ${policyFile}.`);
                    }

                    policyJsDoc.description = getJsDocDescription(jsDocComment);
                    /**
                     * 🔥 the order of the array determines the order in the generated markdown.
                     */
                    const knownTags: string[] = ["severity", "frameworks", "topics", "link"];
                    knownTags.forEach(knownTag => {
                        let tag = getJsDocTag(knownTag, jsDocComment);
                        if (tag) {
                            if (tag.name === "link" && tag.value === "none") {
                                return;
                            }
                            policyJsDoc.jsDocTags.push(tag);
                        }
                    });

                    /**
                     * Retrieve the policy name by traversing downward the AST
                     */
                    traverse(exportNamedDeclarationNode.node, {
                        VariableDeclaration: variableDeclarationNode => {

                            traverse(variableDeclarationNode.node, {

                                CallExpression: callExpressionNode => {

                                    traverse(callExpressionNode.node, {

                                        ObjectExpression: objectExpressionNode => {

                                            for (let x = 0; x < objectExpressionNode.node.properties.length; x++) {
                                                const obj = objectExpressionNode.node.properties[x];
                                                if (obj.type !== "ObjectProperty") {
                                                    continue;
                                                }
                                                if(obj.key.type !== "Identifier") {
                                                    continue;
                                                }

                                                if (obj.key.name !== "resourceValidationPolicy") {
                                                    continue;
                                                }

                                                if (obj.value.type === "ObjectExpression") {
                                                    policyJsDoc.name = getPolicyName(obj.value);
                                                } else {
                                                    throw new Error(`Expecting an 'ObjectExpression' for '${obj.key.name}' in '${policyFile}'.`);
                                                }
                                            }
                                            objectExpressionNode.stop();
                                        }
                                    }, callExpressionNode.scope);
                                }
                            }, variableDeclarationNode.scope);
                        }
                    }, exportNamedDeclarationNode.scope);
                },
            });

            providerMarkdown += eta.render("policy", {
                name: policyJsDoc.name,
                description: policyJsDoc.description,
                codepath: policyJsDoc.codePath,
                tags: policyJsDoc.jsDocTags,
                wantServiceHeading: previousService !== policyJsDoc.service ? true : false,
                service: policyJsDoc.service,
                wantResourceHeading: previousService !== policyJsDoc.service || previousResource !== policyJsDoc.resource ? true : false,
                resource: policyJsDoc.resource,
                colors: { /** Colors based on severity */
                    "low": "#B7E4C7",
                    "medium": "#F9F88A", // #FFF689, #F9F88A
                    "high": "#F4D8A5",
                    "critical": "#E4A5A5",
                }
            });

            previousService = policyJsDoc.service;
            previousResource = policyJsDoc.resource;
        } /** end for (inputFiles) */

        fs.writeFileSync(`${destinationDir}/premium-policies-${provider}.md`, providerMarkdown, {
            flag: "w+"
        });
    }
}

function cmd_policyManager(sourceDirectory: string, destinationFile: string) {

}

commander.program
    .command("provider")
    .description("Run the program")
    .requiredOption("--vendor-name <name>", "The policy vendor name (ie, 'aws')")
    .requiredOption("--vendor-directory <directory>", "The policy vendor directory (ie, ../vendor-aws)")
    .requiredOption("--providers <provider>,<provider>", "A comma separated list of providers to process (ie, aws,awsnative or azure,azurenative)")
    .requiredOption("--destination-dir <directory>", "The path where to store the generated markdown file(s). (ie, ../docs/public/aws/")
    .action((options) => {

        options.vendorDirectory = (options.vendorDirectory as string).replace(/\/$/, "");
        options.providers = (options.providers as string).split(",");
        options.destinationDir = (options.destinationDir as string).replace(/\/$/, "");
        cmd_vendor(options.vendorName, options.vendorDirectory, options.providers, options.destinationDir);
    });

commander.program
    .command("policy-manager")
    .description("Run the program")
    .requiredOption("--source-directory <directory>", "The policy manager source directory (ie, ../policy-manager)")
    .requiredOption("--destination-file <directory>", "The path where to store the generated markdown file. (ie, ../docs/public/api/policy-manager.md)")
    .action((options) => {

        options.sourceDirectory = (options.sourceDirectory as string).replace(/\/$/, "");
        cmd_policyManager(options.sourceDirectory, options.destinationFile);
    });

commander.program.parse();
