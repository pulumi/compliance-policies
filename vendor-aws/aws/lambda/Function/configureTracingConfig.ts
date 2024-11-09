// Copyright 2016-2024, Pulumi Corporation.
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

import { Function } from "@pulumi/aws/lambda";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that Lambda functions have tracing configured.
 *
 * @severity low
 * @frameworks none
 * @topics logging, performance
 * @link https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html
 */
export const configureTracingConfig: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-lambda-function-configure-tracing-config",
        description: "Checks that Lambda functions have tracing configured.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Function, (f, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

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
