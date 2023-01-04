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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.apigatewayv2.Stage, {
        apiId: enums.apigatewayv2.apiId,
        accessLogSettings: {
            destinationArn: enums.cloudwatch.logGroupArn,
            format: enums.apigatewayv2.accessLogFormat,
        },
    });
}

describe("aws.apigatewayv2.Stage.enableAccessLogging", function() {
    const policy = policies.aws.apigatewayv2.Stage.enableAccessLogging;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-apigatewayv2-stage-enable-access-logging");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["apigatewayv2"],
            severity: "medium",
            topics: ["network", "logging"],
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

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.accessLogSettings = undefined;
        await assertHasResourceViolation(policy, args, { message: "API Gateway V2 stages should have access logging enabled." });
    });
});

describe("aws.apigatewayv2.Stage.configureAccessLogging", function() {
    const policy = policies.aws.apigatewayv2.Stage.configureAccessLogging;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-apigatewayv2-stage-configure-access-logging");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["apigatewayv2"],
            severity: "medium",
            topics: ["network", "logging"],
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

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.accessLogSettings.destinationArn = "";
        await assertHasResourceViolation(policy, args, { message: "API Gateway V2 stages should have access logging configured." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.accessLogSettings.format = "";
        await assertHasResourceViolation(policy, args, { message: "API Gateway V2 stages should have access logging configured." });
    });
});
