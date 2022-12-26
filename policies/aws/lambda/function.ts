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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "../../utils";

/**
 * Checks that all Lambda Functions have a description.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html
 */
export const missingDescription: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-lambda-function-missing-description",
        description: "Checks that all Lambda Functions have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.lambda.Function, (f, args, reportViolation) => {
            if (!f.description) {
                reportViolation("Lambda functions should have a description.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "low",
    topics: ["documentation"],
});

/**
 * Checks that Lambda functions have tracing enabled.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html
 */
export const enableTracingConfig: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-lambda-function-enable-tracing-config",
        description: "Checks that Lambda functions have tracing enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.lambda.Function, (f, args, reportViolation) => {
            if (!f.tracingConfig) {
                reportViolation("Lambda functions should have tracing enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "low",
    topics: ["logging", "performance"],
});

/**
 * Checks that Lambda functions have tracing configured.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html
 */
export const configureTracingConfig: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-lambda-function-configure-tracing-config",
        description: "Checks that Lambda functions have tracing configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.lambda.Function, (f, args, reportViolation) => {
            if (f.tracingConfig && f.tracingConfig.mode !== "Active") {
                reportViolation("Lambda functions should have tracing configured.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "low",
    topics: ["logging", "performance"],
});
