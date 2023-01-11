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

import "mocha";
import {
    assertHasResourceViolation,
    assertNoResourceViolations,
    assertResourcePolicyIsRegistered,
    assertResourcePolicyRegistrationDetails,
    createResourceValidationArgs,
    assertResourcePolicyName,
    assertResourcePolicyEnforcementLevel,
    assertResourcePolicyDescription,
    assertCodeQuality
} from "@pulumi-premium-policies/unit-test-helpers";
import * as azure from "@pulumi/azure-native";

import * as policies from "../../../index";
import {ResourceValidationArgs} from "@pulumi/policy";
import * as enums from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(azure.compute.VirtualMachine, {
        resourceGroupName: enums.resourcegroup.ResourceGroupName,
        location: enums.resourcegroup.Location,
        hardwareProfile: {
            vmSize: "Standard_D2s_v4"
        },
        storageProfile: {
            osDisk: {
                createOption: "fromImage",
            },
            imageReference: {
                publisher: "canonical",
                offer: "0001-com-ubuntu-server-jammy",
                sku: "22_04-lts-gen2",
                version: "latest"
            }
        },
        networkProfile: {
            networkInterfaces: [{
                id: "nic1",
                deleteOption: "Detach",
            }]
        },
        osProfile: {
            computerName: "test",
            adminUsername: "ubuntu",
            linuxConfiguration: {
                disablePasswordAuthentication: true
            }
        },
    });
}

describe("azurenative.compute.VirtualMachine.disallowPasswordAuthentication", function () {
    const policy = policies.azurenative.compute.VirtualMachine.disallowPasswordAuthentication;

    it("name", async function () {
        assertResourcePolicyName(policy, "azurenative-compute-virtualmachine-disallow-password-authentication");
    });

    it("registration", async function () {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function () {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["azurenative"],
            services: ["compute"],
            severity: "high",
            topics: ["security"],
        });
    });

    it("enforcementLevel", async function () {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function () {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function () {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function () {
        const args = getResourceValidationArgs();
        args.props.osProfile.linuxConfiguration.disablePasswordAuthentication = false;
        await assertHasResourceViolation(policy, args, {
            message: "Access to virtual machines should be " +
                "authenticated using SSH keys. Removing the option of password authentication enforces more secure " +
                "methods while removing the risks inherent with passwords.",
        });
    });
});
