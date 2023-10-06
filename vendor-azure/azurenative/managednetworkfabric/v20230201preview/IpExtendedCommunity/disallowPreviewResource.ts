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
import { IpExtendedCommunity } from "@pulumi/azure-native/managednetworkfabric/v20230201preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (managednetworkfabric.v20230201preview.IpExtendedCommunity).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-managednetworkfabric-v20230201preview-ipextendedcommunity-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (managednetworkfabric.v20230201preview.IpExtendedCommunity).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(IpExtendedCommunity, (_, args, reportViolation) => {
            reportViolation(
                "Azure IpExtendedCommunity shouldn't use an unstable API (managednetworkfabric.v20230201preview.IpExtendedCommunity). A compatible replacement can be found at 'managednetworkfabric.IpExtendedCommunity'."
            );
        }),
    },
    vendors: ["azure"],
    services: ["managednetworkfabric"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
