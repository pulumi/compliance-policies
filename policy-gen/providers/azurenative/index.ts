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

import { error } from "console";
import { Provider, ProviderArgs } from "../../base/provider";
import * as eta from "eta";

export interface AzureNativeProviderArgs {
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

export class AzureNativeProvider extends Provider {

    constructor(args: AzureNativeProviderArgs) {

        const providerArgs: ProviderArgs = {
            ...args,
            vendorName: "azure",
            exportsTemplateFile: "exports.eta",
        };

        super(providerArgs);
    }

    public generatePolicies() {
        this.disallowPreviewAPIs();
    }

    /**
     * Generate polcies to prevent the use of `*preview*` AzureNative APIs.
     */
    private disallowPreviewAPIs()  {


        const policyVariableName: string = "disallowPreviewResource";
        const policyNameSuffix: string = "disallow-preview-resource";
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

        // eslint-disable-next-line prefer-const
        for (let [rawSchemaResourceName, _] of Object.entries(this.schemaObject.resources)) {
            if (rawSchemaResourceName.toLowerCase().indexOf("preview") < 0) {
                continue;
            }

            const schemaResourceName = this.getSchemaResourceName(rawSchemaResourceName);

            let resourceTypeAlias: string;
            const schemResourceAlias: string = this.getBestResourceAlias(rawSchemaResourceName) || "";
            if (schemResourceAlias) {
                resourceTypeAlias = this.getResourceType(schemResourceAlias);
            } else {
                resourceTypeAlias = "";
            }

            const policyTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyVariableName: policyVariableName,
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
                scopedImport: this.getScopedImportFrom(schemaResourceName),
                resourceTypeAlias: resourceTypeAlias,
            };

            const specTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyFullVariableName: this.getPolicyFullVariableName(schemaResourceName, policyVariableName),
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
                policiesImportPath: this.getPoliciesRelativeImportPath(schemaResourceName),
                resourceTypeAlias: resourceTypeAlias,
            };

            const resourceTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
                scopedImport: this.getScopedImportFrom(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
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
     * This function returns a schema resource name that is an alias of the resource provided. The returned value is considered a stable resource.
     *
     * @param schemaResourceName The resource name as found in the schema(`azure-native:insights:guestDiagnosticsSetting` or `azure-native:insights/v20180601preview:guestDiagnosticsSetting`).
     * @returns A schema resource name as an alias of the provided schema resource name, otherise returns `undefined`.
     */
    private getBestResourceAlias(schemaResourceName: string): string | undefined {
        const schemaResourceNameParts: string[] = schemaResourceName.split(":");
        if (schemaResourceNameParts.length !== 3) {
            throw new Error(`Unexpected schema resource name '${schemaResourceName}'`);
        }

        if (!this.schemaObject.resources) {
            throw new Error(`Unable to find 'schemaObject.resources' in the provider's schema`);
        }

        if (!this.schemaObject.resources[schemaResourceName]) {
            throw new Error(`Unable for find resource 'schemaObject.resources["${schemaResourceName}"]'`);
        }

        const resource = this.schemaObject.resources[schemaResourceName];

        if (!resource.aliases) {
            return undefined;
        }

        const aliases: Array<any> = resource.aliases;
        const unversionedResources: string[] = [];
        const versionedResources: string[] = [];

        for (let index = 0; index < aliases.length; index++) {
            const aliasObject = aliases[index];

            if (!aliasObject.type) {
                throw new Error(`Unable to find alias type 'schemaObject.resources["${schemaResourceName}"].aliases[${index}]'`);
            }
            const aliasName: string = <string>aliasObject.type;
            const aliasParts: string[] = aliasName.split(":");

            if (aliasParts[1].toLowerCase().indexOf("preview") >= 0) {
                /**
                 * This is a non-stable resource, let's skip it.
                 */
                continue;
            }

            if (aliasParts[1].indexOf("/") >= 0) {
                /**
                 * Found something like `azure-native:insights/v20180601:guestDiagnosticsSetting`.
                 */
                versionedResources.push(aliasName);
            } else {
                /**
                 * Found something like `azure-native:insights:guestDiagnosticsSetting`.
                 */
                unversionedResources.push(aliasName);
            }
        }

        if (unversionedResources.length > 1) {
            throw new Error(`Found more than one top level resources. ${unversionedResources.toString()}`);
        }

        if (unversionedResources.length === 1) {
            return this.getSchemaResourceName(unversionedResources.pop()!);
        }

        if (versionedResources.length > 1) {
            return this.getSchemaResourceName(versionedResources.sort().pop()!);
        }

        if (versionedResources.length === 1) {
            return this.getSchemaResourceName(versionedResources.pop()!);
        }
        return undefined;
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
     * @returns The partial path where the policy source file is located (`tests/kubernetes/apps/v1/DaemonSet/disableAlphaResource.ts`).
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
     * From the schema resource name, this function returns the formatted and consistent resource name.
     *
     * @param schemaResourceName The resource name as found in the schema(`azure-native:insights:guestDiagnosticsSetting` or `azure-native:insights/v20180601preview:guestDiagnosticsSetting`).
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
};
