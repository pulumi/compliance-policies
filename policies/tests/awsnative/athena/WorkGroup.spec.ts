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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi-premium-policies/unit-test-helpers";
import * as awsnative from "@pulumi/aws-native";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.athena.WorkGroup, {
        description: "This is a description for awsnative.athena.WorkGroup.",
        workGroupConfiguration: {
            bytesScannedCutoffPerQuery: 1048576000,
            enforceWorkGroupConfiguration: true,
            publishCloudWatchMetricsEnabled: true,
            resultConfiguration: {
                encryptionConfiguration: {
                    encryptionOption: awsnative.athena.WorkGroupEncryptionOption.SseKms,
                    kmsKey: enums.kms.keyArn,
                },
            },
        },
        workGroupConfigurationUpdates: {
            bytesScannedCutoffPerQuery: 1048576000,
            enforceWorkGroupConfiguration: true,
            publishCloudWatchMetricsEnabled: true,
            resultConfigurationUpdates: {
                encryptionConfiguration: {
                    encryptionOption: awsnative.athena.WorkGroupEncryptionOption.SseKms,
                    kmsKey: enums.kms.keyArn,
                },
            },
        },
        state: awsnative.athena.WorkGroupState.Enabled,
    });
}

describe("awsnative.athena.WorkGroup.missingDescription", function() {
    const policy = policies.awsnative.athena.WorkGroup.missingDescription;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-athena-workgroup-missing-description");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["athena"],
            severity: "low",
            topics: ["documentation"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.description = undefined;
        await assertHasResourceViolation(policy, args, { message: "Athena WorkGroups should have a description." });
    });
});

describe("awsnative.athena.WorkGroup.disallowUnencryptedWorkgroup", function() {
    const policy = policies.awsnative.athena.WorkGroup.disallowUnencryptedWorkgroup;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-athena-workgroup-disallow-unencrypted-workgroup");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["athena"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroup Configurations should be encrypted." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfigurationUpdates = undefined;
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroup Configuration Updates should be encrypted." });
    });
});

describe("awsnative.athena.WorkGroup.configureCustomerManagedKey", function() {
    const policy = policies.awsnative.athena.WorkGroup.configureCustomerManagedKey;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-athena-workgroup-configure-customer-managed-key");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["athena"],
            severity: "low",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfiguration = undefined;
        await assertNoResourceViolations(policy, args);
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfigurationUpdates = undefined;
        await assertNoResourceViolations(policy, args);
    });

    it("#4", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfiguration.resultConfiguration.encryptionConfiguration.encryptionOption = "SSE_S3";
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroups Configurations should be encrypted using a customer-managed key." });
    });

    it("#5", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfigurationUpdates.resultConfigurationUpdates.encryptionConfiguration.encryptionOption = "SSE_S3";
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroups Configuration Updates should be encrypted using a customer-managed key." });
    });
});

describe("awsnative.athena.WorkGroup.enforceConfiguration", function() {
    const policy = policies.awsnative.athena.WorkGroup.enforceConfiguration;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-athena-workgroup-enforce-configuration");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["athena"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfiguration = undefined;
        await assertNoResourceViolations(policy, args);
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfigurationUpdates = undefined;
        await assertNoResourceViolations(policy, args);
    });

    it("#4", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfiguration.enforceWorkGroupConfiguration = false;
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroups Configurations should enforce their configuration to their clients." });
    });

    it("#5", async function() {
        const args = getResourceValidationArgs();
        args.props.workGroupConfigurationUpdates.enforceWorkGroupConfiguration = false;
        await assertHasResourceViolation(policy, args, { message: "Athena Workgroups Configuration Updates should enforce their configuration to their clients." });
    });
});
