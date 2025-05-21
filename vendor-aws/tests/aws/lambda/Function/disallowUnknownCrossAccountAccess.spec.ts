// Copyright 2016-2025, Pulumi Corporation.
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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getResourceValidationArgs } from "./resource";

describe("aws.lambda.Function.disallowUnknownCrossAccountAccess", function() {
    const policy = policies.aws.lambda.Function.disallowUnknownCrossAccountAccess;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-lambda-function-disallow-unknown-cross-account-access");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["lambda"],
            severity: "high",
            topics: ["security", "access-control"],
            frameworks: ["cis"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("policy-config-include", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "corp-resource" ],
        });
        await assertHasResourceViolation(policy, args, {
            message: /This policy can only check certain aspects of Lambda permissions/,
        });
    });

    it("policy-config-exclude", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "some-resource" ],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("#1 - standard lambda function with specific role", async function() {
        const args = getResourceValidationArgs();
        await assertHasResourceViolation(policy, args, {
            message: /This policy can only check certain aspects of Lambda permissions/,
        });
    });

    it("#2 - lambda function with permissions boundary", async function() {
        const args = getResourceValidationArgs();
        args.props.permissionsBoundary = "arn:aws:iam::123456789012:policy/boundary-policy";
        await assertHasResourceViolation(policy, args, {
            message: "Lambda function has a permissions boundary policy attached. Review it to ensure it doesn't grant overly permissive cross-account access.",
        });
    });

    it("#3 - lambda function with wildcard in role", async function() {
        const args = getResourceValidationArgs();
        args.props.role = "arn:aws:iam::123456789012:role/service-role/lambda-*-role";
        await assertHasResourceViolation(policy, args, [
            {
                message: "Lambda function has a role with wildcard (*) in the ARN, which could lead to privilege escalation.",
            },
            {
                message: /This policy can only check certain aspects of Lambda permissions/,
            },
        ]);
    });

    it("#4 - with custom allowed accounts", async function() {
        const args = getResourceValidationArgs();
        args.getConfig = () => ({
            allowedAccountIds: ["123456789012", "210987654321"],
            allowedServices: ["apigateway.amazonaws.com", "s3.amazonaws.com"],
        });
        await assertHasResourceViolation(policy, args, {
            message: /This policy can only check certain aspects of Lambda permissions/,
        });
    });

    it("#5 - with custom allowed organizations", async function() {
        const args = getResourceValidationArgs();
        args.getConfig = () => ({
            allowedOrganizationIds: ["o-a1b2c3d4e5", "o-f6g7h8i9j0"],
        });
        await assertHasResourceViolation(policy, args, {
            message: /This policy can only check certain aspects of Lambda permissions/,
        });
    });
});
