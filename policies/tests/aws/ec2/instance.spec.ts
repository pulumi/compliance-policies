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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { ec2, kms } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.ec2.Instance, {
        ami: ec2. imageId,
        instanceType: ec2.instanceType,
        rootBlockDevice: {
            deviceName: "/dev/sda1",
            encrypted: true,
            kmsKeyId: kms.keyArn,
        },
        ebsBlockDevices: [{
            deviceName: "/dev/sdb",
            encrypted: true,
            kmsKeyId: kms.keyArn,
        },{
            deviceName: "/dev/sdc",
            encrypted: true,
            kmsKeyId: kms.keyArn,
        }],
        associatePublicIpAddress: false,
    });
}

describe("aws.ec2.Instance.disallowPublicIP", () => {
    const policy = policies.aws.ec2.Instance.disallowPublicIP;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-ec2-instance-disallow-public-ip");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "high",
            topics: ["network"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.associatePublicIpAddress = true;
        await assertHasResourceViolation(policy, args, { message: "EC2 Instances should not have a public IP address." });
    });
});

describe("aws.ec2.Instance.disallowUnencryptedRootBlockDevice", () => {
    const policy = policies.aws.ec2.Instance.disallowUnencryptedRootBlockDevice;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-ec2-instance-disallow-unencrypted-root-volume");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.rootBlockDevice.encrypted = false;
        await assertHasResourceViolation(policy, args, { message: "EC2 instances should not have an unencypted root block device." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.rootBlockDevice = undefined;
        await assertNoResourceViolations(policy, args);
    });
});

describe("aws.ec2.Instance.disallowUnencryptedBlockDevice", () => {
    const policy = policies.aws.ec2.Instance.disallowUnencryptedBlockDevice;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-ec2-instance-disallow-unencrypted-volumes");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.ebsBlockDevices[1].encrypted = false;
        await assertHasResourceViolation(policy, args, { message: "EC2 instances should not have an unencypted block device." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.ebsBlockDevices = undefined;
        await assertNoResourceViolations(policy, args);
    });
});