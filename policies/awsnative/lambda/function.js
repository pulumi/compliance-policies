"use strict";
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
exports.__esModule = true;
exports.configureTracingConfig = exports.enableTracingConfig = void 0;
var awsnative = require("@pulumi/aws-native");
var policy_1 = require("@pulumi/policy");
var utils_1 = require("../../utils");
/**
 * Checks that Lambda functions have tracing enabled.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html
 */
exports.enableTracingConfig = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-lambda-function-enable-tracing-config",
        description: "Checks that Lambda functions have tracing enabled.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.lambda.Function, function (f, args, reportViolation) {
            if (!f.tracingConfig) {
                reportViolation("Lambda functions should have tracing enabled.");
            }
        })
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "low",
    topics: ["logging", "performance"]
});
/**
 * Checks that Lambda functions have tracing configured.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html
 */
exports.configureTracingConfig = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-lambda-function-configure-tracing-config",
        description: "Checks that Lambda functions have tracing configured.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.lambda.Function, function (f, args, reportViolation) {
            if (f.tracingConfig && f.tracingConfig.mode !== "Active") {
                reportViolation("Lambda functions should have tracing configured.");
            }
        })
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "low",
    topics: ["logging", "performance"]
});
