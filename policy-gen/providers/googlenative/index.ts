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
import { Provider, ProviderArgs } from "../../base/provider";
import * as eta from "eta";

export interface GoogleNativeProviderArgs {
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
     * The maximum number of policies to generate in a single run. Existing policies are skipped and not counted.
     */
    maxPolicyCount: number;
}

export class GoogleNativeProvider extends Provider {

    constructor(args: GoogleNativeProviderArgs) {

        const providerArgs: ProviderArgs = {
            ...args,
            vendorName: "google",
            exportsTemplateFile: "exports.eta",
        };

        super(providerArgs);
    }

    public generatePolicies() {
        this.disallowAlphaAPIs();
        this.disallowBetaAPIs();
    }

    /**
     * Generate polcies to prevent the use of `/*alpha` GoogleNative APIs.
     */
    private disallowAlphaAPIs()  {

        const policyVariableName: string = "disallowAlphaResource";
        const policyNameSuffix: string = "disallow-alpha-resource";
        const policyFilename = `${this.templateBasePath}/${policyVariableName}.eta`;
        const policyTemplateFunction = eta.loadFile(policyFilename, {
            filename: policyFilename,
        });

        const specFilename: string = `${this.templateBasePath}/${policyVariableName}.spec.eta`;
        const specTemplateFunction = eta.loadFile(specFilename, {
            filename: specFilename,
        });

        const resourceFilename: string = `${this.templateBasePath}/resource.eta`;
        const resourceTemplateFunction = eta.loadFile(resourceFilename, {
            filename: resourceFilename,
        });

        const sourceFiles: string[] = this.findFilesByExtension(`${this.directory}/${this.schemaName}`, ".ts").sort();
        for(let x = 0; x < sourceFiles.length; x++) {
            const sourceFile: string = sourceFiles[x].replace(`${this.directory}/`, "");

            const schemaResourceName: string = this.getSchemaResourceNameFromPath(sourceFile);
            const altschemaResourceName: string = this.getSchemaResourceNameFromPath(sourceFile, true);
            if (!this.isSchemaResource(schemaResourceName) && !this.isSchemaResource(altschemaResourceName)) {
                const specFile: string = this.getPolicySpecFile(schemaResourceName, policyVariableName);

                this.deleteSourceFile(sourceFile, policyVariableName);
                this.deleteSpecFile(specFile);
            }
        }

        // eslint-disable-next-line prefer-const
        for (let [rawSchemaResourceName, _] of Object.entries(this.schemaObject.resources)) {
            if (rawSchemaResourceName.toLowerCase().indexOf("alpha") < 0) {
                continue;
            }

            const schemaResourceName = this.getSchemaResourceName(rawSchemaResourceName);

            const serviceName: string = this.capitalizeFirstLetter(this.getServiceName(schemaResourceName));

            const policyTemplateArgs = {
                serviceName: serviceName,
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyVariableName: policyVariableName,
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
                scopedImport: this.getScopedImportFrom(schemaResourceName),
            };

            const specTemplateArgs = {
                serviceName: serviceName,
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyFullVariableName: this.getPolicyFullVariableName(schemaResourceName, policyVariableName),
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
                policiesImportPath: this.getPoliciesRelativeImportPath(schemaResourceName),
            };

            const resourceTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
                scopedImport: this.getScopedImportFrom(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                sourceCode: this.resourceBuilder.getSchemaResourceSourceCode(schemaResourceName, rawSchemaResourceName),
            };

            const sourceFile: string = this.getPolicySourceFile(schemaResourceName, policyVariableName);
            const specFile: string = this.getPolicySpecFile(schemaResourceName, policyVariableName);
            const resourceFile: string = this.getPolicyResourceFile(schemaResourceName);

            const policySourceCode = eta.render(policyTemplateFunction, policyTemplateArgs);
            const specSourceCode = eta.render(specTemplateFunction, specTemplateArgs);
            const resourceSourceCode = eta.render(resourceTemplateFunction, resourceTemplateArgs);

            if (!this.saveSourceFile(sourceFile, policySourceCode, policyVariableName)) {
                return;
            }
            this.saveSpecFile(specFile, specSourceCode, resourceFile, resourceSourceCode);
        }
    }

    /**
     * Generate polcies to prevent the use of `/*beta` GoogleNative APIs.
     */
    private disallowBetaAPIs()  {

        const policyVariableName: string = "disallowBetaResource";
        const policyNameSuffix: string = "disallow-beta-resource";
        const policyFilename = `${this.templateBasePath}/${policyVariableName}.eta`;
        const policyTemplateFunction = eta.loadFile(policyFilename, {
            filename: policyFilename,
        });

        const specFilename: string = `${this.templateBasePath}/${policyVariableName}.spec.eta`;
        const specTemplateFunction = eta.loadFile(specFilename, {
            filename: specFilename,
        });

        const resourceFilename: string = `${this.templateBasePath}/resource.eta`;
        const resourceTemplateFunction = eta.loadFile(resourceFilename, {
            filename: resourceFilename,
        });

        const sourceFiles: string[] = this.findFilesByExtension(`${this.directory}/${this.schemaName}`, ".ts").sort();
        for(let x = 0; x < sourceFiles.length; x++) {
            const sourceFile: string = sourceFiles[x].replace(`${this.directory}/`, "");

            const schemaResourceName: string = this.getSchemaResourceNameFromPath(sourceFile);
            const altschemaResourceName: string = this.getSchemaResourceNameFromPath(sourceFile, true);
            if (!this.isSchemaResource(schemaResourceName) && !this.isSchemaResource(altschemaResourceName)) {
                const specFile: string = this.getPolicySpecFile(schemaResourceName, policyVariableName);

                this.deleteSourceFile(sourceFile, policyVariableName);
                this.deleteSpecFile(specFile);
            }
        }

        // eslint-disable-next-line prefer-const
        for (let [rawSchemaResourceName, _] of Object.entries(this.schemaObject.resources)) {
            if (rawSchemaResourceName.toLowerCase().indexOf("beta") < 0) {
                continue;
            }

            const schemaResourceName = this.getSchemaResourceName(rawSchemaResourceName);

            const serviceName: string = this.capitalizeFirstLetter(this.getServiceName(schemaResourceName));

            const policyTemplateArgs = {
                serviceName: serviceName,
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyVariableName: policyVariableName,
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
                scopedImport: this.getScopedImportFrom(schemaResourceName),
            };

            const specTemplateArgs = {
                serviceName: serviceName,
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyFullVariableName: this.getPolicyFullVariableName(schemaResourceName, policyVariableName),
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
                policiesImportPath: this.getPoliciesRelativeImportPath(schemaResourceName),
            };

            const resourceTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
                scopedImport: this.getScopedImportFrom(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                sourceCode: this.resourceBuilder.getSchemaResourceSourceCode(schemaResourceName, rawSchemaResourceName),
            };

            const sourceFile: string = this.getPolicySourceFile(schemaResourceName, policyVariableName);
            const specFile: string = this.getPolicySpecFile(schemaResourceName, policyVariableName);
            const resourceFile: string = this.getPolicyResourceFile(schemaResourceName);

            const policySourceCode = eta.render(policyTemplateFunction, policyTemplateArgs);
            const specSourceCode = eta.render(specTemplateFunction, specTemplateArgs);
            const resourceSourceCode = eta.render(resourceTemplateFunction, resourceTemplateArgs);

            if (!this.saveSourceFile(sourceFile, policySourceCode, policyVariableName)) {
                return;
            }
            this.saveSpecFile(specFile, specSourceCode, resourceFile, resourceSourceCode);
        }
    }

    /**
     * Returns the partial path to access a spec resource file.
     *
     * @param schemaResourceName The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @returns The partial path where the spec resource file is located (`tests/kubernetes/apps/v1/DaemonSet/disableAlphaResource.ts`).
     */
    private getPolicyResourceFile(schemaResourceName: string): string {
        const packageName: string = this.getPackageName(schemaResourceName).toLowerCase().replace(/\./g, "/");
        const shortResourceType: string = this.getShortResourceType(schemaResourceName);

        return `tests/${this.schemaName}/${packageName}/${shortResourceType}/resource.ts`;
    }

    /**
     * Returns the partial path to access a policy spec file.
     *
     * @param schemaResourceName The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @param policyName The policy variable name (`disableAlphaResource`).
     * @returns The partial path where the policy source file is located (`tests/kubernetes/apps/v1/DaemonSet/disableAlphaResource.spec.ts`).
     */
    private getPolicySpecFile(schemaResourceName: string, policyVariableName: string): string {
        const packageName: string = this.getPackageName(schemaResourceName).toLowerCase().replace(/\./g, "/");
        const shortResourceType: string = this.getShortResourceType(schemaResourceName);

        return `tests/${this.schemaName}/${packageName}/${shortResourceType}/${policyVariableName}.spec.ts`;
    }

    /**
     * Returns the partial path to access a policy source file.
     *
     * @param schemaResourceName The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @param policyName The policy variable name (`disableAlphaResource`).
     * @returns The partial path where the policy source file is located (`kubernetes/apps/v1/DaemonSet/disableAlphaResource.ts`).
     */
    private getPolicySourceFile(schemaResourceName: string, policyVariableName: string): string {
        const packageName: string = this.getPackageName(schemaResourceName).toLowerCase().replace(/\./g, "/");
        const shortResourceType: string = this.getShortResourceType(schemaResourceName);

        return `${this.schemaName}/${packageName}/${shortResourceType}/${policyVariableName}.ts`;
    }

    /**
     * Return a string that contains an array of services for the provided schema resource.
     *
     * @param schemaResourceName The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @returns A strings that contains an array of services related to the policy (`["apps", "daemonset"]` or `["apiextensions", "customresourcedefinition"]`).
     */
    private getTemplatePolicyServices(schemaResourceName: string): string {
        const packageName: string = this.getPackageName(schemaResourceName).split(".")[0];
        const shortResourceType: string = this.getShortResourceType(schemaResourceName);
        return `["${packageName}"]`.toLowerCase();
    }

    /**
     * Return the relative import path for the given resource. This funciotn is used in building unit test files.
     *
     * @param resourceType The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @returns Returns a relative path to the top level `index.ts` (`../../../../../`).
     */
    private getPoliciesRelativeImportPath(schemaResourceName: string): string {
        return `tests.${this.schemaName}.${this.getResourceType(schemaResourceName)}`.split(".").reduce((prev, curr) => prev += "../", "");
    }

    /**
     * Return the policy full variable name based on the schema resource name and a provided policy variable name.
     *
     * @param resourceType The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @param policyName The policy variable name (`disableAlphaResource`).
     * @returns Returns a unique policy name (`kubernetes.apps.v1.DaemonSet.configureRecommendedLabels`).
     */
    private getPolicyFullVariableName(schemaResourceName: string, policyName: string): string {
        return `${this.schemaName}.${this.getResourceType(schemaResourceName)}.${policyName}`;
    }

    /**
     * Return the unique policy name based on the schema resource name and a provided suffix.
     *
     * @param resourceType The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @param suffix The policy name siffix.
     * @returns Returns a unique policy name (`kubernetes-admissionregistration-v1alpha1-validatingAdmissionPolicy`).
     */
    private getPolicyName(schemaResourceName: string, suffix: string): string {
        return `${this.schemaName}-${this.getResourceType(schemaResourceName).replace(/\./g, "-")}-${suffix}`.toLowerCase();
    }

    /**
     * From the schema resource name, this function returns the policy variable name.
     *
     * @param resourceType The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @returns The policy resource variable name (`validatingAdmissionPolicy`).
     */
    private getPolicyResourceVariableName(schemaResourceName: string): string {
        const shortResourceType: string = this.getShortResourceType(schemaResourceName);
        return shortResourceType.charAt(0).toLowerCase() + shortResourceType.slice(1);
    }

    /**
     * From the schema resource name, this function returns the corresponding coimplete resource type.
     *
     * @param schemaResourceName The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @returns The provider's resource type.
     */
    private getResourceType(schemaResourceName: string): string {
        const schemaResourceNameParts: string[] = schemaResourceName.split(":");
        if (schemaResourceNameParts.length !== 3) {
            throw new Error(`Unexpected schema resource name '${schemaResourceName}'`);
        }
        return `${this.getPackageName(schemaResourceName)}.${this.getShortResourceType(schemaResourceName)}`;
    }

    /**
     * From the schema resource name, this function returns the corresponding shorthand resource type.
     *
     * @param schemaResourceName The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @returns The shorthand resource type (`DaemonSet` or `CustomResourceDefinition`).
     */
    private getShortResourceType(schemaResourceName: string): string {
        const schemaResourceNameParts: string[] = schemaResourceName.split(":");
        if (schemaResourceNameParts.length !== 3) {
            throw new Error(`Unexpected schema resource name '${schemaResourceName}'`);
        }
        return schemaResourceNameParts[2];
    }

    /**
     * From the schema resource name, this function returns the corresponding package name.
     *
     * @param schemaResourceName The resource name as found in the schema (`kubernetes:apps/v1:DaemonSet` or `kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition`).
     * @returns The provider's package name (`apps.v1` or `apiextensions.v1`).
     */
    private getPackageName(schemaResourceName: string): string {
        const schemaResourceNameParts: string[] = schemaResourceName.split(":");
        if (schemaResourceNameParts.length !== 3) {
            throw new Error(`Unexpected schema resource name '${schemaResourceName}'`);
        }

        return schemaResourceNameParts[1].replace(/\//g, ".");
    }

    /**
     * From the schema resource name, this function returns the corresponding service name stripped from any version.
     *
     * @param schemaResourceName The resource name as found in the schema (`google-native:compute/alpha:FirewallPolicy`, `google-native:datastream/v1alpha1:Route` or `google-native:compute/v1:Address`).
     * @returns The service name (`compute` or `datastream`).
     */
    private getServiceName(schemaResourceName: string): string {
        const schemaResourceNameParts: string[] = schemaResourceName.split(":");
        if (schemaResourceNameParts.length !== 3) {
            throw new Error(`Unexpected schema resource name '${schemaResourceName}'`);
        }

        const packageName: string = this.getPackageName(schemaResourceName);
        const packageNameParts: string[] = packageName.split(".");

        if (packageNameParts.length < 1) {
            throw new Error(`Unable to get service name for resource ${schemaResourceName}.`);
        }

        return packageNameParts[0];
    }

    /**
     * From the schema resource name, this function returns the formatted and consistent resource name.
     *
     * @param schemaResourceName The resource name as found in the schema(`google-native:appengine/v1:AuthorizedCertificate` or `google-native:appengine/v1alpha:AuthorizedCertificate`).
     * @returns The consistently formatted schema resource name.
     * @link https://github.com/pulumi/pulumi-azure-native/issues/2365
     */
    private getSchemaResourceName(schemaResourceName: string): string {
        const schemaResourceNameParts: string[] = schemaResourceName.split(":");
        if (schemaResourceNameParts.length !== 3) {
            throw new Error(`Unexpected schema resource name '${schemaResourceName}'`);
        }

        const regex = RegExp(/(.*:)(.*:)([a-z])(.*)/gi);
        const matches = regex.exec(schemaResourceName);

        if (!matches) {
            throw new Error(`Failed to format schema resource name '${schemaResourceName}'`);
        }

        if (matches.length !== 5) {
            throw new Error(`The schema resource name '${schemaResourceName}' did not decompose in 4 elements.`);
        }

        return `${matches[1]}${matches[2]}${matches[3].toUpperCase()}${matches[4]}`;
    }

    /**
     * Convert the path of a policy source file into a schema resource name.
     *
     * @param policySourceFile The absolute or relative path to the policy source file (`azure-native/aadiam/v20170401preview/DiagnosticSetting`). If `policySourceFile` starts with `/`, the path is assumed absolute.
     * @param useBrokenCase Some resource names have inconsistent case. Set this to `true` to obtain such resource name.
     * @returns A schema resource name. (`azure-native:aadiam/v20170401preview:DiagnosticSetting`).
     * @link https://github.com/pulumi/pulumi-azure-native/issues/2365
     */
    private getSchemaResourceNameFromPath(policySourceFile: string, useBrokenCase?: boolean): string {

        let schemaResourceName: string = "";
        let filename: string = "";
        if (policySourceFile.startsWith("/")) {
            filename = policySourceFile.replace(`${this.directory}/`, "");
        } else {
            filename = policySourceFile;
        }
        filename = path.dirname(filename);
        filename = filename.replace(this.schemaName, this.args.name);

        const matches = filename.match(/([a-zA-Z0-9\-]+\/?[a-zA-Z0-9\-]*?)/g);
        if (matches) {
            for (let x = 0; x < matches.length; x++) {
                const match = matches[x];
                if (x === 0 || x === (matches.length - 2)) {
                    schemaResourceName += match.replace("/", ":");
                } else if (x === (matches.length - 1) && useBrokenCase) {
                    schemaResourceName += `${match.charAt(0).toLowerCase()}${match.slice(1)}`;
                } else {
                    schemaResourceName += match;
                }
            }
        }
        return schemaResourceName;
    }

    /**
     * Check if the provided resource name exists in the schema.
     *
     * @param schemaResourceName The schema resource name to search for (`azure-native:containerregistry/v20211201preview:ScopeMap`).
     * @returns `true` if the resource exists in the schema, `false` otherwise.
     */
    private isSchemaResource(schemaResourceName: string): boolean {
        if (!this.schemaObject.resources) {
            throw new Error(`Unable to find 'schemaObject.resources' in the provider's schema`);
        }

        if (this.schemaObject.resources[schemaResourceName]) {
            return true;
        }
        return false;
    }

    /**
     * From the schema resource name, this function returns the scoped import statement.
     *
     * @param schemaResourceName The resource name as found in the schema(`azure-native:insights:guestDiagnosticsSetting` or `azure-native:insights/v20180601preview:guestDiagnosticsSetting`).
     * @returns The scoped resource import (`@pulumi/azure-native/insights` or `@pulumi/azure-native/insights/v20180601preview`).
     */
    private getScopedImportFrom(schemaResourceName: string): string {
        const schemaResourceNameParts: string[] = schemaResourceName.split(":");
        if (schemaResourceNameParts.length !== 3) {
            throw new Error(`Unexpected schema resource name '${schemaResourceName}'`);
        }

        return `@pulumi/${this.args.name}/${schemaResourceNameParts[1]}`;
    }

    /**
     * This function scans a given directory for files with a matching extensions and returns the results as an array.
     *
     * @param directory A path to an existing directory to find files in.
     * @param extension The desired file extension to look for.
     * @returns An array of files.
     */
    private findFilesByExtension(directory: string, extension: string): string[] {
        const files: string[] = [];

        const dirContent = fs.readdirSync(directory);

        for (let index = 0; index < dirContent.length; index++) {
            const file = dirContent[index];
            const fullPath = path.join(directory, file);

            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...this.findFilesByExtension(fullPath, extension));
            } else if (path.extname(file) === extension) {
                if (path.basename(file) !== "index.ts") {
                    files.push(fullPath);
                }
            }
        }
        return files;
    }

    /**
     * Convert the first letter of a word to uppercase.
     * @param word The word to convert.
     * @returns The word with its first letter capitalized.
     */
    private capitalizeFirstLetter(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
};
