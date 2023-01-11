// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
