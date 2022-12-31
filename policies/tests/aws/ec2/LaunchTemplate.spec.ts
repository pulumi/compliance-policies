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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { ec2, kms } from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.ec2.LaunchTemplate, {
        imageId: ec2.imageId,
        instanceType: ec2.instanceType,
        blockDeviceMappings: [{
            deviceName: "/dev/sda1",
            ebs: {
                encrypted: String(true), // see https://github.com/pulumi/pulumi-aws/issues/2257
                kmsKeyId: kms.keyArn,
                volumeSize: 20,
            },
        }],
        networkInterfaces: [{
            associatePublicIpAddress: String(false), // see https://github.com/pulumi/pulumi-aws/issues/2257
        }],
        vpcSecurityGroupIds: [ec2.vpcSecurityGroupId],
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
        assertCodeQuality(this.test?.parent?.title);
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
        assertCodeQuality(this.test?.parent?.title);
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
        assertCodeQuality(this.test?.parent?.title);
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
