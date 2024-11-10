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

import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";
import { ManagedDisk } from "@pulumi/azure/compute";

/**
 * Checks that Disks are encrypted.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.microsoft.com/azure/virtual-machines/linux/disk-encryption-overview
 */
export const disallowUnencryptedManagedDisk: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azure-compute-manageddisk-disallow-unencrypted-managed-disk",
        description: "Checks that Disks are encrypted.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(ManagedDisk, (disk, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (disk.encryptionSettings === undefined) {
                reportViolation("A Disk is currently not encrypted.");
            }
        }),
    },
    vendors: ["azure"],
    services: ["compute"],
    severity: "high",
    topics: ["storage", "encryption"],
    frameworks: ["pcidss", "iso27001"],
});
