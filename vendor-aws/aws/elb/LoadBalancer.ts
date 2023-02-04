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
 * Check that ELB Load Balancers do not allow unencrypted (HTTP) traffic.
 *
 * @severity Critical
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-https-load-balancers.html
 */
export const disallowUnencryptedTraffic: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-loadbalancer-disallow-unencrypted-traffic",
        description: "Check that ELB Load Balancers do not allow unencrypted (HTTP) traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.elb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            loadBalancer.listeners.forEach((listener) => {
                if (listener.lbProtocol.toLowerCase() === "http") {
                    reportViolation("ELB Load Balancers should now allow unencrypted (HTTP) traffic.");
                }
            });
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "critical",
    topics: ["network"],
});

/**
 * Check that ELB Load Balancers uses more than one availability zone.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/enable-disable-az.html
 */
export const configureMultiAvailabilityZone: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-loadbalancer-configure-multi-availability-zone",
        description: "Check that ELB Load Balancers uses more than one availability zone.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.elb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (!loadBalancer.availabilityZones || loadBalancer.availabilityZones.length < 2) {
                reportViolation("ELB Load Balancers should use more than one availability zone.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "high",
    topics: ["network", "availability"],
});

/**
 * Check that ELB Load Balancers uses access logging.
 *
 * @severity Medium
 * @ link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/access-log-collection.html
 */
export const configureAccessLogging: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-loadbalancer-configure-access-logging",
        description: "Check that ELB Load Balancers uses access logging.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.elb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (!loadBalancer.accessLogs || loadBalancer.accessLogs.enabled === false) {
                reportViolation("ELB Load Balancers should have access logging enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "medium",
    topics: ["network", "logging"],
});

/**
 * Check that ELB Load Balancers have a health check enabled.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-healthchecks.html
 */
export const enableHealthCheck: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-loadbalancer-enable-health-check",
        description: "Check that ELB Load Balancers have a health check enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.elb.LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (!loadBalancer.healthCheck) {
                reportViolation("ELB Load Balancers should have health checks enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "high",
    topics: ["network", "availability"],
});
