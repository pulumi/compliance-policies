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
import { assertHasResourceViolation, assertNoResourceViolations, assetResourcePolicyIsRegistered, assetResourcePolicyRegistrationDetails, createResourceValidationArgs, assetResourcePolicyName } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.secretsmanager.Secret, {
        description: "This is a description for this Secrets Manager secret.",
        kmsKeyId: "arn:aws:kms:us-east-1:123456781234:key/1234abcd-12ab-34cd-56ef-1234567890ab",
    });
}

describe("aws.secretsmanager.Secret.missingDescription", () => {
    const policy = policies.aws.secretsmanager.Secret.missingDescription;

    it("missingDescription (name)", async () => {
        assetResourcePolicyName(policy, "aws-secrets-manager-secret-missing-description");
    });

    it("missingDescription (registration)", async () => {
        assetResourcePolicyIsRegistered(policy);
    });

    it("missingDescription (metadata)", async () => {
        assetResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["secretsmanager"],
            severity: "low",
            topics: ["documentation"],
        });
    });

    it("missingDescription #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("missingDescription #2", async () => {
        const args = getResourceValidationArgs();
        args.props.description = undefined;
        await assertHasResourceViolation(policy, args, { message: "Secrets Manager Secrets should have a description." });
    });

    it("missingDescription #3", async () => {
        const args = getResourceValidationArgs();
        args.props.description = "abc";
        await assertHasResourceViolation(policy, args, { message: "Secrets Manager Secrets should have a meaningful description." });
    });
});

describe("aws.secretsmanager.Secret.configureCustomerManagedKey", () => {
    const policy = policies.aws.secretsmanager.Secret.configureCustomerManagedKey;

    it("configureCustomerManagedKey (name)", async () => {
        assetResourcePolicyName(policy, "aws-secrets-manager-secret-configure-customer-managed-key");
    });

    it("configureCustomerManagedKey (registration)", async () => {
        assetResourcePolicyIsRegistered(policy);
    });

    it("configureCustomerManagedKey (metadata)", async () => {
        assetResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["secretsmanager"],
            severity: "low",
            topics: ["encryption"],
        });
    });

    it("configureCustomerManagedKey #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowUnencryptedVolume #2", async () => {
        const args = getResourceValidationArgs();
        args.props.kmsKeyId = undefined;
        await assertHasResourceViolation(policy, args, { message: "Secrets Manager Secrets should be encrypted using a customer-managed KMS key." });
    });
});
