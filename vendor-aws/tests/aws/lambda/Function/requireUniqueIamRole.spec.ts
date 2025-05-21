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

describe("aws.lambda.Function.requireUniqueIamRole", function() {
    const policy = policies.aws.lambda.Function.requireUniqueIamRole;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-lambda-function-require-unique-iam-role");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["lambda"],
            severity: "high",
            topics: ["security", "access-control", "principle-of-least-privilege"],
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
            message: /Please ensure that the IAM role/,
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
        args.props.role = "arn:aws:iam::123456789012:role/lambda-function-specific-role";
        await assertHasResourceViolation(policy, args, {
            message: /Please ensure that the IAM role 'lambda-function-specific-role' is dedicated to this Lambda function/,
        });
    });

    it("#2 - lambda function with shared role name", async function() {
        const args = getResourceValidationArgs();
        args.props.role = "arn:aws:iam::123456789012:role/shared-lambda-role";
        await assertHasResourceViolation(policy, args, {
            message: /Lambda function appears to be using a shared IAM role 'shared-lambda-role'/,
        });
    });

    it("#3 - lambda function with common role name", async function() {
        const args = getResourceValidationArgs();
        args.props.role = "arn:aws:iam::123456789012:role/LambdaBasicExecution";
        await assertHasResourceViolation(policy, args, {
            message: /Lambda function appears to be using a shared IAM role 'LambdaBasicExecution'/,
        });
    });

    it("#4 - lambda function with exempt role", async function() {
        const args = getResourceValidationArgs();
        args.props.role = "arn:aws:iam::123456789012:role/shared-lambda-role";
        args.getConfig = () => ({
            exemptRoleNames: ["shared-lambda-role"],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("#5 - lambda function with exempt role pattern", async function() {
        const args = getResourceValidationArgs();
        args.props.role = "arn:aws:iam::123456789012:role/lambda-shared-microservice-role";
        args.getConfig = () => ({
            exemptRolePatterns: ["lambda-shared-microservice-.*"],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("#6 - lambda function without role", async function() {
        const args = getResourceValidationArgs();
        args.props.role = undefined;
        await assertHasResourceViolation(policy, args, {
            message: "Lambda function does not have an execution role specified.",
        });
    });

    it("#7 - lambda function with malformed role ARN", async function() {
        const args = getResourceValidationArgs();
        args.props.role = "arn:aws:iam::123456789012:role";
        await assertHasResourceViolation(policy, args, {
            message: "Could not determine role name from ARN.",
        });
    });
});
