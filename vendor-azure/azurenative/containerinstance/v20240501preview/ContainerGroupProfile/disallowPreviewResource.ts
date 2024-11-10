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
import { ContainerGroupProfile } from "@pulumi/azure-native/containerinstance/v20240501preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (containerinstance.v20240501preview.ContainerGroupProfile).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-containerinstance-v20240501preview-containergroupprofile-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (containerinstance.v20240501preview.ContainerGroupProfile).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(ContainerGroupProfile, (_, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation(
                "Azure ContainerGroupProfile shouldn't use an unstable API (containerinstance.v20240501preview.ContainerGroupProfile). A compatible replacement can be found at 'containerinstance.ContainerGroupProfile'."
            );
        }),
    },
    vendors: ["azure"],
    services: ["containerinstance"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
