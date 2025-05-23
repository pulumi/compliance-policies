// Copyright 2016-2025, Pulumi Corporation.
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
import { ResourceTypeRegistration } from "@pulumi/azure-native/providerhub/v20210901preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (providerhub.v20210901preview.ResourceTypeRegistration).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-providerhub-v20210901preview-resourcetyperegistration-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (providerhub.v20210901preview.ResourceTypeRegistration).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(ResourceTypeRegistration, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation(
                "Azure ResourceTypeRegistration shouldn't use an unstable API (providerhub.v20210901preview.ResourceTypeRegistration). A compatible replacement can be found at 'providerhub.ResourceTypeRegistration'."
            );
        }),
    },
    vendors: ["azure"],
    services: ["providerhub"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
