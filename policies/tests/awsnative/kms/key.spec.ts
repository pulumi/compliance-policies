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
import * as awsnative from "@pulumi/aws-native";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.kms.Key, {
        keyPolicy: undefined, // TODO: add a proper key policy
        description: "This is a description for this KMS key.",
        enableKeyRotation: true,
    });
}

describe("awsnative.kms.Key.enableKeyRotation", () => {
    const policy = policies.awsnative.kms.Key.enableKeyRotation;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-kms-key-enable-key-rotation");
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
        args.props.enableKeyRotation = undefined;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have key rotation enabled." });
    });
});

describe("awsnative.kms.Key.missingDescription", () => {
    const policy = policies.awsnative.kms.Key.missingDescription;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-kms-key-missing-description");
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
        args.props.description = undefined;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have a description." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.description = "key";
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have a meaningful description." });
    });
});
