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

import { Provider, ProviderArgs } from "../../base/provider";
import * as eta from "eta";

export interface KubernetesProviderArgs {
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
}

export class KubernetesProvider extends Provider {

    // private vendorName: string = "kubernetes";

    constructor(args: KubernetesProviderArgs) {

        const providerArgs: ProviderArgs = {
            ...args,
            vendorName: "kubernetes",
            exportsTemplateFile: "exports.eta",
        };

        super(providerArgs);
    }

    public generatePolicies() {
        this.disallowAlphaAPIs();
        this.disallowBetaAPIs();
    }

    /**
     * Generate polcies to prevent the use of `*alpha*` Kubernetes APIs.
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

        for (const [schemaResourceName, _] of Object.entries(this.schemaObject.resources)) {
            if (schemaResourceName.toLowerCase().indexOf("alpha") < 0) {
                continue;
            }

            const policyTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyVariableName: policyVariableName,
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
            };

            const specTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyFullVariableName: this.getPolicyFullVariableName(schemaResourceName, policyVariableName),
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
                policiesImportPath: this.getPoliciesRelativeImportPath(schemaResourceName),
            };

            const resourceTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
            };

            const sourceFile: string = this.getPolicySourceFile(schemaResourceName, policyVariableName);
            const specFile: string = this.getPolicySpecFile(schemaResourceName, policyVariableName);
            const resourceFile: string = this.getPolicyResourceFile(schemaResourceName);

            const policySourceCode = eta.render(policyTemplateFunction, policyTemplateArgs);
            const specSourceCode = eta.render(specTemplateFunction, specTemplateArgs);
            const resourceSourceCode = eta.render(resourceTemplateFunction, resourceTemplateArgs);

            this.saveSourceFile(sourceFile, policySourceCode, policyVariableName);
            this.saveSpecFile(specFile, specSourceCode, resourceFile, resourceSourceCode);
        }
    }
    /**
     * Generate polcies to prevent the use of `*beta*` Kubernetes APIs.
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

        for (const [schemaResourceName, _] of Object.entries(this.schemaObject.resources)) {
            if (schemaResourceName.toLowerCase().indexOf("beta") < 0) {
                continue;
            }

            const policyTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyVariableName: policyVariableName,
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
            };

            const specTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
                shortResourceType: this.getShortResourceType(schemaResourceName),
                policyFullVariableName: this.getPolicyFullVariableName(schemaResourceName, policyVariableName),
                policyName: this.getPolicyName(schemaResourceName, policyNameSuffix),
                metadataServices: this.getTemplatePolicyServices(schemaResourceName),
                policiesImportPath: this.getPoliciesRelativeImportPath(schemaResourceName),
            };

            const resourceTemplateArgs = {
                resourceType: this.getResourceType(schemaResourceName),
            };

            const sourceFile: string = this.getPolicySourceFile(schemaResourceName, policyVariableName);
            const specFile: string = this.getPolicySpecFile(schemaResourceName, policyVariableName);
            const resourceFile: string = this.getPolicyResourceFile(schemaResourceName);

            const policySourceCode = eta.render(policyTemplateFunction, policyTemplateArgs);
            const specSourceCode = eta.render(specTemplateFunction, specTemplateArgs);
            const resourceSourceCode = eta.render(resourceTemplateFunction, resourceTemplateArgs);

            this.saveSourceFile(sourceFile, policySourceCode, policyVariableName);
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
        return `["${packageName}", "${shortResourceType}"]`.toLowerCase();
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

        if (!this.schemaObject.language) {
            throw new Error(`Unable to find 'schemaObject.language' in the provider's schema.`);
        }

        if (!this.schemaObject.language.nodejs) {
            throw new Error(`Unable to find 'schemaObject.language.nodejs' in the provider's schema.`);
        }

        if (!this.schemaObject.language.nodejs.moduleToPackage) {
            throw new Error(`Unable to find 'schemaObject.language.nodejs.moduleToPackage' in the provider's schema.`);
        }

        const moduleName: string = schemaResourceNameParts[1];

        if (!this.schemaObject.language.nodejs.moduleToPackage[moduleName]) {
            throw new Error(`Unable to find 'schemaObject.language.nodejs.moduleToPackage."${moduleName}"' in the provider's schema.`);
        }

        return this.schemaObject.language.nodejs.moduleToPackage[moduleName].replace(/\//g, ".");
    }
};
