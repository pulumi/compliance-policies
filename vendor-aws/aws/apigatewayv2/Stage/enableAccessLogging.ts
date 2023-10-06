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

import { Stage } from "@pulumi/aws/apigatewayv2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that any ApiGatewayV2 Stages have access logging enabled.
 *
 * @severity medium
 * @frameworks iso27001, pcidss
 * @topics logging, network
 * @link https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html
 */
export const enableAccessLogging: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-apigatewayv2-stage-enable-access-logging",
        description: "Checks that any ApiGatewayV2 Stages have access logging enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Stage, (stage, args, reportViolation) => {
            if (!stage.accessLogSettings) {
                reportViolation("API Gateway V2 stages should have access logging enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["apigatewayv2"],
    severity: "medium",
    topics: ["network", "logging"],
    frameworks: ["pcidss", "iso27001"],
});
