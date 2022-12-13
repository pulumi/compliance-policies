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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { root, kms } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.efs.FileSystem, {
        encrypted: true,
        kmsKeyId: kms.keyArn,
    });
}

describe("aws.efs.FileSystem.disallowUnencryptedFileSystem", () => {
    const policy = policies.aws.efs.FileSystem.disallowUnencryptedFileSystem;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-efs-file-system-disallow-unencrypted-file-system");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["efs"],
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
        args.props.encrypted = undefined;
        await assertHasResourceViolation(policy, args, { message: "EFS File systems should not have an unencypted file system." });
    });
});

describe("aws.efs.FileSystem.configureCustomerManagedKey", () => {
    const policy = policies.aws.efs.FileSystem.configureCustomerManagedKey;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-efs-file-system-configure-customer-managed-key");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["efs"],
            severity: "low",
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
        args.props.kmsKeyId = "";
        await assertHasResourceViolation(policy, args, { message: "An EFS File System should be encrypted using a customer-managed KMS key." });
    });
});

describe("aws.efs.FileSystem.disallowSingleAvailabilityZone", () => {
    const policy = policies.aws.efs.FileSystem.disallowSingleAvailabilityZone;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-efs-file-system-disallow-single-availability-zone");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["efs"],
            severity: "high",
            topics: ["storage", "availability"],
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
        args.props.availabilityZoneName = root.availabilityZone1;
        await assertHasResourceViolation(policy, args, { message: "EFS File Systems should use more than one availability zone." });
    });
});
