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
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as parserTypes from "@babel/types";

export interface PolicyMetadata {
    vendorsString?: string;
    servicesString?: string;
    severityString?: string;
    topicsString?: string;
    frameworksString?: string;
};

export interface PremiumPolicyArgs {
    /**
     * Full path to a policy file.
     */
    policyFile: string;
};

export class PremiumPolicy {

    private args: PremiumPolicyArgs;

    public readonly vendors: string[];
    public readonly services: string[];
    public readonly severity: string;
    public readonly topics: string[];
    public readonly frameworks: string[];

    constructor(args: PremiumPolicyArgs) {
        this.args = args;

        if (!fs.existsSync(this.args.policyFile)) {
            throw new Error(`The policy file '${this.args.policyFile}' doesn't exist.`);
        }

        const policyFileText: string = fs.readFileSync(this.args.policyFile, "utf-8");
        const policyMetadata: PolicyMetadata = this.parsePolicySource(policyFileText);

        if (policyMetadata.vendorsString) {
            this.vendors = policyMetadata.vendorsString.replaceAll(", ", ",").split(",");
        }

        if (policyMetadata.servicesString) {
            this.services = policyMetadata.servicesString.replaceAll(", ", ",").split(",");
        }

        if (policyMetadata.severityString) {
            this.severity = policyMetadata.severityString;
        }

        if (policyMetadata.topicsString) {
            this.topics = policyMetadata.topicsString.replaceAll(", ", ",").split(",");
        }

        if (policyMetadata.frameworksString) {
            this.frameworks = policyMetadata.frameworksString.replaceAll(", ", ",").split(",");
        }

    }

    private parsePolicySource(policyFileText: string): PolicyMetadata {
        const policyFileParseResults = parser.parse(policyFileText, {
            attachComment: true,
            sourceType: "module",
            sourceFilename: this.args.policyFile,
            plugins: [
                "typescript",
            ],
        });

        if (!policyFileParseResults) {
            throw new Error(`Unable to parse ${this.args.policyFile}`);
        }

        const policyMetadata: PolicyMetadata = {};

        traverse(policyFileParseResults, {
            ExportNamedDeclaration: exportNamedDeclarationNode => {

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
                                                /*
                                                 * The policy itself.
                                                 */
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
                                                policyMetadata.vendorsString = this.extractArrayToString(obj.value);
                                                break;
                                            case "services":
                                                if(obj.value.type !== "ArrayExpression") {
                                                    throw new Error(`Expecting an 'ArrayExpression' for '${obj.key.name}'.`);
                                                }
                                                policyMetadata.servicesString = this.extractArrayToString(obj.value);
                                                break;
                                            case "topics":
                                                if(obj.value.type !== "ArrayExpression") {
                                                    throw new Error(`Expecting an 'ArrayExpression' for '${obj.key.name}'.`);
                                                }
                                                policyMetadata.topicsString = this.extractArrayToString(obj.value);
                                                break;
                                            case "frameworks":
                                                if(obj.value.type !== "ArrayExpression") {
                                                    throw new Error(`Expecting an 'ArrayExpression' for '${obj.key.name}'.`);
                                                }
                                                policyMetadata.frameworksString = this.extractArrayToString(obj.value);
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

        return policyMetadata;
    }
    /**
     * From an ArrayExpression object, returns a string of the values.
     *
     * @param arrayExpressionObject The ArrayExpression containing the multiple strings.
     * @returns A string representing the values of the provided ArrayExpression, or "none" is there was no values.
     */
    private extractArrayToString(arrayExpressionObject: parserTypes.ArrayExpression): string {

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

};

