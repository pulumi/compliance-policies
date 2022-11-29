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
import { policyRegistrations } from "../../utils";

/**
 * Checks that Lambda functions have tracing enabled.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html
 */
export const tracingEnabled: ResourceValidationPolicy = {
    name: "aws-lambda-function-disallow-lambda-without-tracing",
    description: "Checks that Lambda functions have tracing enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.lambda.Function, (f, args, reportViolation) => {
        if (f.tracingConfig?.mode !== "Active") {
            reportViolation("Lambda functions should have tracing enabled.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: tracingEnabled,
    vendors: ["aws"],
    services: ["lambda"],
    severity: "low",
    topics: ["logging", "performance"],
});