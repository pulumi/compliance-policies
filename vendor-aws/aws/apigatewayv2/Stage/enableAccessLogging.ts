// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";

import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that any ApiGatewayV2 Stages have access logging enabled.
 *
 * @severity Medium
 * @link https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html
 */
export const enableAccessLogging: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-apigatewayv2-stage-enable-access-logging",
        description: "Checks that any ApiGatewayV2 Stages have access logging enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.apigatewayv2.Stage, (stage, args, reportViolation) => {
            if (!stage.accessLogSettings) {
                reportViolation("API Gateway V2 stages should have access logging enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["apigatewayv2"],
    severity: "medium",
    topics: ["network", "logging"],
});
