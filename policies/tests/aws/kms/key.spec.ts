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

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.kms.Key, {
        bypassPolicyLockoutSafetyCheck: false,
        description: "This is a description for this KMS key.",
        enableKeyRotation: true,
    });
}

describe("aws.kms.Key.enableKeyRotation", () => {
    const policy = policies.aws.kms.Key.enableKeyRotation;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-kms-key-enable-key-rotation");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["kms"],
            severity: "medium",
            topics: ["encryption"],
        });
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.enableKeyRotation = undefined;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have key rotation enabled." });
    });
});

describe("aws.kms.Key.missingDescription", () => {
    const policy = policies.aws.kms.Key.missingDescription;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-kms-key-missing-description");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["kms"],
            severity: "low",
            topics: ["documentation"],
        });
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.description = undefined;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have a description." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.description = "key";
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have a meaningful description." });
    });
});

describe("aws.kms.Key.disallowBypassPolicyLockoutSafetyCheck", () => {
    const policy = policies.aws.kms.Key.disallowBypassPolicyLockoutSafetyCheck;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-kms-key-disallow-bypass-policy-lockout-safety-check");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["kms"],
            severity: "critical",
            topics: ["encryption"],
        });
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.bypassPolicyLockoutSafetyCheck = true;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should not bypass the key policy lockout safety check." });
    });
});
