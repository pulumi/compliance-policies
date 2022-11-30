// Copyright 2016-2022, Pulumi Corporation.
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
import { assertHasResourceViolation, assertNoResourceViolations, createResourceValidationArgs } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.ec2.Instance, {
        ami: "ami-12345678",
        instanceType: "t2.micro",
        rootBlockDevice: {
            deviceName: "/dev/sda1",
            encrypted: true,
            kmsKeyId: "arn:aws:kms:us-east-1:123456781234:key/1234abcd-12ab-34cd-56ef-1234567890ab",
        },
        ebsBlockDevices: [{
            deviceName: "/dev/sdb",
            encrypted: true,
            kmsKeyId: "arn:aws:kms:us-east-1:123456781234:key/1234abcd-12ab-34cd-56ef-1234567890ab",
        },{
            deviceName: "/dev/sdc",
            encrypted: true,
            kmsKeyId: "arn:aws:kms:us-east-1:123456781234:key/1234abcd-12ab-34cd-56ef-1234567890ab",
        }],
        associatePublicIpAddress: false,
    });
}

describe("aws.ec2.Instance.disallowPublicIP", () => {
    const policy = policies.aws.ec2.Instance.disallowPublicIP;


    it("disallowPublicIP #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowPublicIP #2", async () => {
        const args = getResourceValidationArgs();
        args.props.associatePublicIpAddress = true;
        await assertHasResourceViolation(policy, args, { message: "EC2 Instances should not have a public IP address." });
    });
});

describe("aws.ec2.Instance.disallowUnencryptedRootBlockDevice", () => {
    const policy = policies.aws.ec2.Instance.disallowUnencryptedRootBlockDevice;

    it("disallowUnencryptedRootBlockDevice #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowUnencryptedRootBlockDevice #2", async () => {
        const args = getResourceValidationArgs();
        args.props.rootBlockDevice.encrypted = false;
        await assertHasResourceViolation(policy, args, { message: "EC2 instances should not have an unencypted root block device." });
    });
});

describe("aws.ec2.Instance.disallowUnencryptedBlockDevice", () => {
    const policy = policies.aws.ec2.Instance.disallowUnencryptedBlockDevice;

    it("disallowUnencryptedBlockDevice #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowUnencryptedBlockDevice #2", async () => {
        const args = getResourceValidationArgs();
        args.props.ebsBlockDevices[1].encrypted = false;
        await assertHasResourceViolation(policy, args, { message: "EC2 instances should not have an unencypted block device." });
    });
});