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

import { Provider } from "./provider";

export interface ResourceBuilderArgs {

    /**
     * An instance of a Pulumi provider.
     */
    provider: Provider;
}

interface DiscriminatorType {
    propertyName: string;
    mapping: {
        [key: string]: string;
    };
}

interface ResourceAlias {
    type: string;
}

interface OneOfType {
    type: string;
}

interface oneOfTypeArray {
    oneOf: OneOfType[];
}

interface OneOfRef {
    "$ref": string;
}

interface oneOfRefArray {
    oneOf: OneOfRef[];
}

interface EnumValue {
    value: string;
}

/**
 * `InputProperties` interface defines the various input properties for a resource.
 */
interface InputProperties {
    description?: string;
    type?: string;
    items?: OneOfType & OneOfRef & oneOfRefArray & oneOfTypeArray;
    oneOf?: OneOfType[] & OneOfRef[];
    discriminator?: DiscriminatorType;
    "$ref"?: string;
    additionalProperties?: object;
    default?: string;
    const?: string;
}

interface TypeProperties {
    type: string;
    description?: string;
    properties?: {
        [key: string]: InputProperties;
    };
    required?: string[];
    items?: OneOfType & OneOfRef;
    oneOf?: OneOfType[] & OneOfRef[];
    discriminator?: DiscriminatorType;
    "$ref"?: string;
    const?: string;
    enum?: EnumValue[];
}

/**
 * `ResourceArgs` interface defines the resource schema.
 */
interface ResourceArgs {
    type: string;
    description?: string;
    // properties?: Object[]; // we shouldn't care since it's used for property outputs.
    // required?: string[]; // we shouldn't care since it's used for required property outputs.
    inputProperties?: {
        [key: string]: InputProperties;
    };
    requiredInputs?: string[];
    aliases?: ResourceAlias[];
}

export class ResourceBuilder {

    protected readonly args: ResourceBuilderArgs;

    constructor(args: ResourceBuilderArgs) {
        this.args = args;
    }

    /**
     * From the schema resource name, generate the typescript source code to create a valid resource.
     *
     * @param schemaResourceName The resource name as found in the schema(`azure-native:insights:guestDiagnosticsSetting` or `azure-native:insights/v20180601preview:guestDiagnosticsSetting`).
     * @returns A string that contains the resource source code.
     */
    public getSchemaResourceSourceCode(schemaResourceName: string, rawSchemaResourceName: string): string {
        // console.log(schemaResourceName);
        const schemaObject: any = this.args.provider.getSchema();

        if (!Object.hasOwn(schemaObject.resources, schemaResourceName) && !Object.hasOwn(schemaObject.resources, rawSchemaResourceName)) {
            /**
             * We shouldn't arrive here as it would mean something didn't work out
             * in the provider's schema.
             */
            return "undefined";
        }

        const resource: ResourceArgs = <ResourceArgs>schemaObject.resources[schemaResourceName] || <ResourceArgs>schemaObject.resources[rawSchemaResourceName];

        // console.log(schemaResourceName);

        /**
         * Either there's no `requiredInputs`, or the `requiredInputs` isn't an array, or it is empty.
         * Either way, we won't be able to iterate, so we return an empty source code.
         */
        if (!resource.requiredInputs || !resource.requiredInputs.length) {
            // FIXME: Should we return the proper string based on `.type`?
            return "{}";
        }
        const requiredInputs: string[] = <string[]>resource.requiredInputs;
        let resourceSourceCode: string = " {\n";

        for( let i = 0; i < requiredInputs.length; i++) {
            const inputPropertyName: string = requiredInputs[i];

            if (!resource.inputProperties) {
                throw new Error(`Resource '${schemaResourceName}' has '${inputPropertyName}' as a required Input but there's no '.inputProperties' defined in the resource.`);
            }
            if (!resource.inputProperties[inputPropertyName]) {
                throw new Error(`Resource '${schemaResourceName}' has '${inputPropertyName}' as a required Input but it can't be found in '.inputProperties'.`);
            }

            const inputProperty: InputProperties = <InputProperties>resource.inputProperties[inputPropertyName];

            if (inputProperty.type) {
                switch(inputProperty.type) {
                case "array":
                    // console.log(inputProperty);
                    if (inputProperty.items) {
                        if (inputProperty.items.type) {
                            resourceSourceCode += `${inputPropertyName}: [${ this.getArraySourceCode(inputPropertyName, inputProperty.items.type)}],\n`;
                        } else if (inputProperty.items.$ref) {
                            const propertyTypeName: string = decodeURIComponent(inputProperty.items.$ref.replace("#/types/", ""));
                            resourceSourceCode += `${inputPropertyName}: [${ this.getSchemaTypeSourceCode(propertyTypeName) }],\n`;
                        } else if (inputProperty.items.oneOf && inputProperty.items.oneOf[0].$ref) {
                            const propertyTypeName: string = decodeURIComponent(inputProperty.items.oneOf[0].$ref.replace("#/types/", ""));
                            // console.log(propertyTypeName);
                            resourceSourceCode += `${inputPropertyName}: [${ this.getSchemaTypeSourceCode(propertyTypeName) }],\n`;
                        } else if (inputProperty.items.oneOf && inputProperty.items.oneOf[0].type) {
                            resourceSourceCode += `${inputPropertyName}: [${ this.getArraySourceCode(inputPropertyName, inputProperty.items.oneOf[0].type)}],\n`;
                        }
                    }
                    break;
                case "boolean":
                    resourceSourceCode += `${inputPropertyName}: false,\n`;
                    break;
                case "integer":
                    resourceSourceCode += `${inputPropertyName}: 1,\n`;
                    break;
                case "number":
                    resourceSourceCode += `${inputPropertyName}: 1.0,\n`;
                    break;
                case "object":
                    resourceSourceCode += `${inputPropertyName}: {},\n`;
                    break;
                case "string":
                    resourceSourceCode += `${inputPropertyName}: "${inputProperty.const ? inputProperty.const : "" }",\n`;
                    break;
                default:
                    throw new Error(`Type not implemented: ${inputProperty.type}`);
                    break;
                }
            } else if (inputProperty.discriminator) {

                const discriminatorMappingKeys = Object.keys(inputProperty.discriminator.mapping);
                const discriminatorPropertyValue: string = discriminatorMappingKeys[0];
                const discriminatorPropertyTypeName: string = decodeURIComponent(inputProperty.discriminator.mapping[discriminatorPropertyValue].replace("#/types/", ""));

                resourceSourceCode += `${inputPropertyName}: `;
                resourceSourceCode += `${this.getSchemaTypeSourceCode(discriminatorPropertyTypeName)}`;

            } else if (inputProperty.oneOf && inputProperty.oneOf.length) {
                let foundType: boolean = false;
                for (let j = 0; j < inputProperty.oneOf.length; j++) {
                    const oneOf = inputProperty.oneOf[j];
                    if (oneOf.type) {
                        switch(oneOf.type!) {
                        case "array":
                            resourceSourceCode += `${inputPropertyName}: ["blabla"],\n`;
                            break;
                        case "boolean":
                            resourceSourceCode += `${inputPropertyName}: false,\n`;
                            break;
                        case "integer":
                            resourceSourceCode += `${inputPropertyName}: 1,\n`;
                            break;
                        case "number":
                            resourceSourceCode += `${inputPropertyName}: 1.0,\n`;
                            break;
                        case "object":
                            resourceSourceCode += `${inputPropertyName}: {},\n`;
                            break;
                        case "string":
                            resourceSourceCode += `${inputPropertyName}: "${inputProperty.const ? inputProperty.const : "" }",\n`;
                            break;
                        default:
                            throw new Error(`Type not implemented: ${inputProperty.type}`);
                            break;
                        }
                        foundType = true;
                        break;
                    }

                    if (oneOf.$ref) {
                        // FIXME: Should we process that entry or hope to find `oneOf.type` in the next element?
                        foundType = false;
                    }
                }
                if (!foundType) {

                    const propertyTypeName: string = decodeURIComponent(inputProperty.oneOf[0].$ref.replace("#/types/", ""));

                    resourceSourceCode += `${inputPropertyName}: ${this.getSchemaTypeSourceCode(propertyTypeName)}`;
                    // throw new Error(`Resource '${schemaResourceName}' has a required input '${inputPropertyName}' of type 'oneOf' but only '$ref' was found.`);
                }
            } else if (inputProperty.$ref) {
                const propertyTypeName: string = decodeURIComponent(inputProperty.$ref.replace("#/types/", ""));
                resourceSourceCode += `${inputPropertyName}: ${this.getSchemaTypeSourceCode(propertyTypeName)}`;
            }
        }
        resourceSourceCode += "}";
        return resourceSourceCode;
    }

    /**
     * From the schema type name, generate the typescript source code to create a valid property.
     *
     * @param schemaTypeName The type name as found in the schema.
     * @returns A string that contains the type source code.
     */
    private getSchemaTypeSourceCode(schemaTypeName: string): string {
        const schemaObject: any = this.args.provider.getSchema();

        if (Object.hasOwn(schemaObject.types, schemaTypeName)) {
            const typeProperties: TypeProperties = <TypeProperties>schemaObject.types[schemaTypeName];


            // console.log(schemaTypeName);

            /**
             * Either there's no `required`, or the `required` property isn't an array.
             * Either way, we won't be able to iterate, so we return an empty source code.
             */
            if (!typeProperties.required || !typeProperties.required.length) {
                switch(typeProperties.type) {
                case "array":
                    return "[],\n";
                case "boolean":
                    return "false,\n";
                case "integer":
                    return "1,\n";
                case "number":
                    return "1.0,\n";
                case "object":
                    return "{},\n";
                case "string":
                    if (typeProperties.enum) {
                        return `"${typeProperties.enum[0].value}",\n`;
                    }
                    return "\"\",\n";
                default:
                    throw new Error(`Type not implemented: ${typeProperties.type}`);
                    break;
                }
            }

            const requiredInputs: string[] = <string[]>typeProperties.required;
            if (typeProperties.type !== "object") {
                throw new Error(`Type not expected: ${typeProperties.type} for '${schemaTypeName}'`);
            }
            let typeSourceCode: string = "{\n";

            for (let i = 0; i < requiredInputs.length; i++) {
                const inputPropertyName: string = requiredInputs[i];

                if (!typeProperties.properties) {
                    throw new Error(`Type '${schemaTypeName}' has '${inputPropertyName}' as a required property but there's no '.properties' defined in this type.`);
                }
                if (!typeProperties.properties[inputPropertyName]) {
                    throw new Error(`Type '${schemaTypeName}' has '${inputPropertyName}' as a required property but it can't be found in '.properties'.`);
                }

                const inputProperty: TypeProperties = <TypeProperties>typeProperties.properties[inputPropertyName];

                if (inputProperty.type) {
                    switch(inputProperty.type) {
                    case "array":
                        if (inputProperty.items && inputProperty.items.type) {
                            typeSourceCode += `${inputPropertyName}: [${ this.getArraySourceCode(inputPropertyName, inputProperty.items.type)}],\n`;
                        } else if (inputProperty.items && inputProperty.items.$ref) {
                            const propertyTypeName: string = decodeURIComponent(inputProperty.items.$ref.replace("#/types/", ""));

                            typeSourceCode += `${inputPropertyName}: [${ this.getSchemaTypeSourceCode(propertyTypeName) }],\n`;
                        }
                        break;
                    case "boolean":
                        typeSourceCode += `${inputPropertyName}: false,\n`;
                        break;
                    case "integer":
                        typeSourceCode += `${inputPropertyName}: 1,\n`;
                        break;
                    case "number":
                        typeSourceCode += `${inputPropertyName}: 1.0,\n`;
                        break;
                    case "object":
                        typeSourceCode += `${inputPropertyName}: {},\n`;
                        break;
                    case "string":
                        if (inputProperty.enum) {
                            typeSourceCode += `${inputPropertyName}: "${inputProperty.enum[0].value ? inputProperty.enum[0].value : "" }",\n`;
                        } else {
                            typeSourceCode += `${inputPropertyName}: "${inputProperty.const ? inputProperty.const : "" }",\n`;
                        }
                        break;
                    default:
                        throw new Error(`Type not implemented: ${inputProperty.type}`);
                        break;
                    }
                } else if (inputProperty.discriminator) {

                    // const discriminatorPropertyName: string = inputProperty.discriminator.propertyName;
                    const discriminatorMappingKeys = Object.keys(inputProperty.discriminator.mapping);
                    const discriminatorPropertyValue: string = discriminatorMappingKeys[0];
                    const discriminatorPropertyTypeName: string = decodeURIComponent(inputProperty.discriminator.mapping[discriminatorPropertyValue].replace("#/types/", ""));

                    typeSourceCode += `${inputPropertyName}: `;
                    typeSourceCode += `${this.getSchemaTypeSourceCode(discriminatorPropertyTypeName)}`;

                } else if (inputProperty.oneOf && inputProperty.oneOf.length) {
                    let foundType: boolean = false;
                    for (let j = 0; j < inputProperty.oneOf.length; j++) {
                        const oneOf = inputProperty.oneOf[j];

                        if (oneOf.type) {
                            switch(oneOf.type) {
                            case "array":
                                typeSourceCode += `${inputPropertyName}: [${ this.getArraySourceCode(inputPropertyName, oneOf.type)}],\n`;
                                break;
                            case "boolean":
                                typeSourceCode += `${inputPropertyName}: false,\n`;
                                break;
                            case "integer":
                                typeSourceCode += `${inputPropertyName}: 1,\n`;
                                break;
                            case "number":
                                typeSourceCode += `${inputPropertyName}: 1.0,\n`;
                                break;
                            case "object":
                                typeSourceCode += `${inputPropertyName}: {},\n`;
                                break;
                            case "string":
                                typeSourceCode += `${inputPropertyName}: "",\n`;
                                break;
                            default:
                                throw new Error(`Type not implemented: ${inputProperty.type}`);
                                break;
                            }
                            foundType = true;
                            break;
                        }

                        if (oneOf.$ref) {
                            // FIXME: Should we process that entry or hope to find `oneOf.type` in the next element?
                            foundType = false;
                        }
                    }
                    if (!foundType) {
                        // FIXME: This won't work with a discriminator
                        if (inputProperty.discriminator) {
                            // throw new Error(`Discriminators aren't implemented.`);
                            console.log(`Discriminators aren't implemented (type): '${schemaTypeName}'.`);
                            return "{},\n";
                        }

                        const propertyTypeName: string = decodeURIComponent(inputProperty.oneOf[0].$ref.replace("#/types/", ""));

                        typeSourceCode += `${inputPropertyName}: ${this.getSchemaTypeSourceCode(propertyTypeName)}`;

                        // throw new Error(`Type '${schemaTypeName}' has a required input '${inputPropertyName}' of type 'oneOf' but only '$ref' was found.`);
                    }
                } else if (inputProperty.$ref) {
                    const propertyTypeName: string = decodeURIComponent(inputProperty.$ref.replace("#/types/", ""));
                    typeSourceCode += `${inputPropertyName}: ${this.getSchemaTypeSourceCode(propertyTypeName)}`;
                }
            }

            typeSourceCode += "},\n";
            return typeSourceCode;
        }

        if (schemaTypeName === "pulumi.json#/Any") {
            return "[\"\"],\n";
        }

        return "undefined";
    }

    /**
     * Return an array of values based on the supplied property name and the type of the values to populate.
     *
     * @param propertyName Name of the property that will receive the value.
     * @param propertyType Type of the property.
     * @returns A string that contains the source code.
     */
    private getArraySourceCode(propertyName: string, propertyType: string): string {

        let propertySourceCode: string = "";

        switch(propertyType) {
        case "array":
            // FIXME: We should read in array inner type rathr than leaving it empty.
            propertySourceCode += `[]`;
            break;
        case "string":
            propertySourceCode += `""`;
            break;
        case "boolean":
            propertySourceCode += `false`;
            break;
        case "integer":
            propertySourceCode += `1`;
            break;
        case "number":
            propertySourceCode += `1.0`;
            break;
        case "object":
            propertySourceCode += `{}`;
            break;
        default:
            throw new Error(`Type not implemented: '${propertyType}' for property '${propertyName}'`);
            break;

        }
        return propertySourceCode;
    }
}
