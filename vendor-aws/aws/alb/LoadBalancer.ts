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
 * Checks that ALB loadbalancers have access logging enabled.
 *
 * @severity medium
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html
 */
export const enableAccessLogging: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-alb-loadbalancer-enable-access-logging",
        description: "Checks that ALB loadbalancers have access logging enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.alb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (!loadBalancer.accessLogs) {
                reportViolation("ALB LoadBalancers should have access logging enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["alb"],
    severity: "medium",
    topics: ["network", "logging"],
});

/**
 * Checks that ALB loadbalancers have access logging configured and enabled.
 *
 * @severity medium
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html
 */
export const configureAccessLogging: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-alb-loadbalancer-configure-access-logging",
        description: "Checks that ALB loadbalancers have access logging configured and enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.alb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (loadBalancer.accessLogs && (!loadBalancer.accessLogs.enabled || !loadBalancer.accessLogs.bucket)) {
                reportViolation("ALB LoadBalancers should have access logging configured and enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["alb"],
    severity: "medium",
    topics: ["network", "logging"],
});
