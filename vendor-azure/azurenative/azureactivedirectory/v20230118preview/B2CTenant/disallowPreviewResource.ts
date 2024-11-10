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

/**
 * Default imports for a policy.
 */
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";
import { B2CTenant } from "@pulumi/azure-native/azureactivedirectory/v20230118preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (azureactivedirectory.v20230118preview.B2CTenant).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-azureactivedirectory-v20230118preview-b2ctenant-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (azureactivedirectory.v20230118preview.B2CTenant).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(B2CTenant, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation(
                "Azure B2CTenant shouldn't use an unstable API (azureactivedirectory.v20230118preview.B2CTenant). A compatible replacement can be found at 'azureactivedirectory.B2CTenant'."
            );
        }),
    },
    vendors: ["azure"],
    services: ["azureactivedirectory"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
