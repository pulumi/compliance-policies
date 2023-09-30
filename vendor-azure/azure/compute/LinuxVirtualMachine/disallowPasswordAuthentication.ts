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
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import { LinuxVirtualMachine } from "@pulumi/azure/compute";

/**
 * Authentication to Linux machines should require SSH keys.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics authentication, security
 * @link https://docs.microsoft.com/azure/virtual-machines/linux/create-ssh-keys-detailed
 */
export const disallowPasswordAuthentication: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azure-compute-linuxvirtualmachine-disallow-password-authentication",
        description: "Authentication to Linux machines should require SSH keys.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(LinuxVirtualMachine, (virtualmachine, args, reportViolation) => {
            if (!virtualmachine.disablePasswordAuthentication) {
                reportViolation("Authentication to Linux machines should require SSH keys.");
            }
        }),
    },
    vendors: ["azure"],
    services: ["compute"],
    severity: "high",
    topics: ["security", "authentication"],
    frameworks: ["pcidss", "iso27001"],
});
