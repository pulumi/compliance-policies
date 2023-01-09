// Copyright 2016-2023, Pulumi Corporation.
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

import * as azure from "@pulumi/azure-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "../../utils";

/**
 * Password authentication should be disabled on Azure virtual machines.
 *
 * @severity High
 */
export const disallowPasswordAuthentication: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-compute-virtualmachine-disallow-password-authentication",
        description: "Password authentication should be disabled on Azure virtual machines.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(azure.compute.VirtualMachine, (virtualmachine, args, reportViolation) => {
            if (virtualmachine.osProfile) {
                if (virtualmachine.osProfile.linuxConfiguration) {
                    if (!virtualmachine.osProfile.linuxConfiguration.disablePasswordAuthentication) {
                        reportViolation("Access to virtual machines should be authenticated using SSH keys. " +
                            "Removing the option of password authentication enforces more secure methods while " +
                            "removing the risks inherent with passwords.");
                    }
                }
            }
        }),
    },
    vendors: ["azurenative"],
    services: ["compute"],
    severity: "high",
    topics: ["security"],
});
