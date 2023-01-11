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
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.ec2.LaunchTemplate, {
        imageId: enums.ec2.imageId,
        instanceType: enums.ec2.instanceType,
        blockDeviceMappings: [{
            deviceName: "/dev/sda1",
            ebs: {
                encrypted: String(true), // see https://github.com/pulumi/pulumi-aws/issues/2257
                kmsKeyId: enums.kms.keyArn,
                volumeSize: 20,
            },
        }],
        networkInterfaces: [{
            associatePublicIpAddress: String(false), // see https://github.com/pulumi/pulumi-aws/issues/2257
        }],
        vpcSecurityGroupIds: [enums.ec2.vpcSecurityGroupId],
    });
}

describe("aws.ec2.LaunchTemplate.disallowPublicIp", function() {
    const policy = policies.aws.ec2.LaunchTemplate.disallowPublicIp;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-launchtemplate-disallow-public-ip");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "high",
            topics: ["network"],
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
        args.props.networkInterfaces[0].associatePublicIpAddress = String(true);
        await assertHasResourceViolation(policy, args, { message: "EC2 Launch templates should not associate a public IP address to an interface." });
    });
});

describe("aws.ec2.LaunchTemplate.disallowUnencryptedBlockDevice", function() {
    const policy = policies.aws.ec2.LaunchTemplate.disallowUnencryptedBlockDevice;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-launchtemplate-disallow-unencrypted-block-device");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
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
        args.props.blockDeviceMappings[0].ebs.encrypted = String(false);
        await assertHasResourceViolation(policy, args, { message: "EC2 Launch Templates should not have an unencypted block device." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.ebsBlockDevices = undefined;
        await assertNoResourceViolations(policy, args);
    });

});

describe("aws.ec2.LaunchTemplate.configureCustomerManagedKey", function() {
    const policy = policies.aws.ec2.LaunchTemplate.configureCustomerManagedKey;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-launchtemplate-configure-customer-managed-key");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
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
        args.props.blockDeviceMappings[0].ebs.kmsKeyId = undefined;
        await assertHasResourceViolation(policy, args, { message: "EC2 Launch Templates should not have encrypted block device using a customer-managed KMS key." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.ebsBlockDevices = undefined;
        await assertNoResourceViolations(policy, args);
    });

});
