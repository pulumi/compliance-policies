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
import { assertHasResourceViolation, assertNoResourceViolations, assetResourcePolicyIsRegistered, assetResourcePolicyRegistrationDetails, createResourceValidationArgs } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.ebs.Volume, {
        encrypted: true,
        kmsKeyId: "arn:aws:kms:us-east-1:123456781234:key/1234abcd-12ab-34cd-56ef-1234567890ab",
        availabilityZone: "us-east1-a",
        size: 16,
    });
}

describe("aws.ebs.Volume.disallowUnencryptedVolume", () => {
    const policy = policies.aws.ebs.Volume.disallowUnencryptedVolume;

    it("disallowUnencryptedVolume #1", async () => {
        assetResourcePolicyIsRegistered(policy);
    });

    it("disallowUnencryptedVolume #2", async () => {
        assetResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ebs"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("disallowUnencryptedVolume #3", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowUnencryptedVolume #4", async () => {
        const args = getResourceValidationArgs();
        args.props.encrypted = false;
        await assertHasResourceViolation(policy, args, { message: "An EBS volume is currently not encrypted." });
    });
});

describe("aws.ebs.Volume.configureCustomerManagedKey", () => {
    const policy = policies.aws.ebs.Volume.configureCustomerManagedKey;

    it("configureCustomerManagedKey #1", async () => {
        assetResourcePolicyIsRegistered(policy);
    });

    it("configureCustomerManagedKey #2", async () => {
        assetResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ebs"],
            severity: "low",
            topics: ["encryption", "storage"],
        });
    });

    it("configureCustomerManagedKey #3", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowUnencryptedVolume #4", async () => {
        const args = getResourceValidationArgs();
        args.props.kmsKeyId = undefined;
        await assertHasResourceViolation(policy, args, { message: "An EBS volume should be encrypted using a customer-managed KMS key." });
    });
});
