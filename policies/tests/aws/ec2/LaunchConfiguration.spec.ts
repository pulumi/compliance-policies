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
import { ec2 } from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.ec2.LaunchConfiguration, {
        imageId: ec2.imageId,
        instanceType: ec2.instanceType,
        associatePublicIpAddress: false,
        rootBlockDevice: {
            volumeType: "gp3",
            volumeSize: 16,
            encrypted: true,
        },
        ebsBlockDevices: [{
            deviceName: "/dev/sdb",
            volumeType: "gp3",
            volumeSize: 16,
            encrypted: true,
        },{
            deviceName: "/dev/sdc",
            volumeType: "standard",
            volumeSize: 16,
            encrypted: true,
        }],

    });
}

describe("aws.ec2.LaunchConfiguration.disallowPublicIp", function() {
    const policy = policies.aws.ec2.LaunchConfiguration.disallowPublicIp;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-launchconfiguration-disallow-public-ip");
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
        args.props.associatePublicIpAddress = true;
        await assertHasResourceViolation(policy, args, { message: "EC2 Launch Configurations should not have a public IP address." });
    });
});

describe("aws.ec2.LaunchConfiguration.disallowUnencryptedRootBlockDevice", function() {
    const policy = policies.aws.ec2.LaunchConfiguration.disallowUnencryptedRootBlockDevice;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-launchconfiguration-disallow-unencrypted-root-block-device");
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
        args.props.rootBlockDevice.encrypted = false;
        await assertHasResourceViolation(policy, args, { message: "EC2 Launch Configurations should not have an unencypted root block device." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.rootBlockDevice = undefined;
        await assertNoResourceViolations(policy, args);
    });
});

describe("aws.ec2.LaunchConfiguration.disallowUnencryptedBlockDevice", function() {
    const policy = policies.aws.ec2.LaunchConfiguration.disallowUnencryptedBlockDevice;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-launchconfiguration-disallow-unencrypted-block-device");
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
        args.props.ebsBlockDevices[1].encrypted = false;
        await assertHasResourceViolation(policy, args, { message: "EC2 Launch Configurations should not have an unencypted block device." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.ebsBlockDevices = undefined;
        await assertNoResourceViolations(policy, args);
    });

});