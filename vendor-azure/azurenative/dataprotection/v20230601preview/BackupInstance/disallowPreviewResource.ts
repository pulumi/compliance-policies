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
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import { BackupInstance } from "@pulumi/azure-native/dataprotection/v20230601preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (dataprotection.v20230601preview.BackupInstance).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-dataprotection-v20230601preview-backupinstance-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (dataprotection.v20230601preview.BackupInstance).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(BackupInstance, (_, args, reportViolation) => {
            reportViolation(
                "Azure BackupInstance shouldn't use an unstable API (dataprotection.v20230601preview.BackupInstance). A compatible replacement can be found at 'dataprotection.BackupInstance'."
            );
        }),
    },
    vendors: ["azure"],
    services: ["dataprotection"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
