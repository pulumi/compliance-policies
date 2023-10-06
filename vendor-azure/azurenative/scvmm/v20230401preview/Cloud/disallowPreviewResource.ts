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
import { Cloud } from "@pulumi/azure-native/scvmm/v20230401preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (scvmm.v20230401preview.Cloud).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-scvmm-v20230401preview-cloud-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (scvmm.v20230401preview.Cloud).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Cloud, (_, args, reportViolation) => {
            reportViolation("Azure Cloud shouldn't use an unstable API (scvmm.v20230401preview.Cloud). A compatible replacement can be found at 'scvmm.Cloud'.");
        }),
    },
    vendors: ["azure"],
    services: ["scvmm"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
