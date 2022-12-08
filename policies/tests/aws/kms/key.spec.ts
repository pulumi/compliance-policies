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
    return createResourceValidationArgs(aws.kms.Key, {
        bypassPolicyLockoutSafetyCheck: false,
        description: "This is a description for this KMS key.",
        enableKeyRotation: true,
    });
}

describe("aws.kms.Key.enableKeyRotation", () => {
    const policy = policies.aws.kms.Key.enableKeyRotation;

    it("enableKeyRotation (name)", async () => {
        assetResourcePolicyName(policy, "aws-kms-key-enable-key-rotation");
    });

    it("enableKeyRotation (registration)", async () => {
        assetResourcePolicyIsRegistered(policy);
    });

    it("enableKeyRotation (metadata)", async () => {
        assetResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["kms"],
            severity: "medium",
            topics: ["encryption"],
        });
    });

    it("enableKeyRotation #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("enableKeyRotation #2", async () => {
        const args = getResourceValidationArgs();
        args.props.enableKeyRotation = undefined;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have key rotation enabled." });
    });
});

describe("aws.kms.Key.missingDescription", () => {
    const policy = policies.aws.kms.Key.missingDescription;

    it("missingDescription (name)", async () => {
        assetResourcePolicyName(policy, "aws-kms-key-missing-description");
    });

    it("missingDescription (registration)", async () => {
        assetResourcePolicyIsRegistered(policy);
    });

    it("missingDescription (metadata)", async () => {
        assetResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["kms"],
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
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have a description." });
    });

    it("missingDescription #3", async () => {
        const args = getResourceValidationArgs();
        args.props.description = "key";
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have a meaningful description." });
    });
});

describe("aws.kms.Key.disallowBypassPolicyLockoutSafetyCheck", () => {
    const policy = policies.aws.kms.Key.disallowBypassPolicyLockoutSafetyCheck;

    it("disallowBypassPolicyLockoutSafetyCheck (name)", async () => {
        assetResourcePolicyName(policy, "aws-kms-key-disallow-bypass-policy-lockout-safety-check");
    });

    it("disallowBypassPolicyLockoutSafetyCheck (registration)", async () => {
        assetResourcePolicyIsRegistered(policy);
    });

    it("disallowBypassPolicyLockoutSafetyCheck (metadata)", async () => {
        assetResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["kms"],
            severity: "critical",
            topics: ["encryption"],
        });
    });

    it("disallowBypassPolicyLockoutSafetyCheck #1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("disallowBypassPolicyLockoutSafetyCheck #2", async () => {
        const args = getResourceValidationArgs();
        args.props.bypassPolicyLockoutSafetyCheck = true;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should not bypass the key policy lockout safety check." });
    });
});
