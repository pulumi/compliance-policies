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
import { iam, kms, root, s3 } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.lambda.Function, {
        description: "This is a lambda function",
        role: iam.roleArn,
        handler: "index.js",
        runtime: "nodejs18.x",
        s3Bucket: s3.bucketId,
        s3Key: "/function.zip",
        environment: {
            variables: {
                "SOMEVAR": "some_value"
            },
        },
        kmsKeyArn: kms.keyArn,
        tracingConfig: {
            mode: "Active"
        }
    });
}

describe("aws.aws.lambda.Function.missingDescription", () => {
    const policy = policies.aws.lambda.Function.missingDescription;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-lambda-function-missing-description");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["lambda"],
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
        args.props.description = "";
        await assertHasResourceViolation(policy, args, { message: "Lambda functions should have a description." });
    });
});

describe("aws.aws.lambda.Function.enableTracingConfig", () => {
    const policy = policies.aws.lambda.Function.enableTracingConfig;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-lambda-function-enable-tracing-config");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["lambda"],
            severity: "low",
            topics: ["logging", "performance"],
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
        args.props.tracingConfig = undefined;
        await assertHasResourceViolation(policy, args, { message: "Lambda functions should have tracing enabled." });
    });
});

describe("aws.aws.lambda.Function.configureTracingConfig", () => {
    const policy = policies.aws.lambda.Function.configureTracingConfig;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-lambda-function-configure-tracing-config");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["lambda"],
            severity: "low",
            topics: ["logging", "performance"],
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
        args.props.tracingConfig.mode = "PassThrough";
        await assertHasResourceViolation(policy, args, { message: "Lambda functions should have tracing configured." });
    });
});
