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
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that all security groups have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/working-with-security-groups.html
 */
export const missingDescription: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-securitygroup-missing-description",
        description: "Checks that all security groups have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (securityGroup, args, reportViolation) => {
            if (!securityGroup.description) {
                reportViolation("EC2 Security Groups should have a description.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "low",
    topics: ["documentation"],
});

/**
 * Checks that all Ingress Security Groups rules have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/working-with-security-groups.html
 */
export const missingIngressRuleDescription: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-securitygroup-missing-ingress-rule-description",
        description: "Checks that all Ingress Security Groups rules have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (securityGroup, args, reportViolation) => {
            if (securityGroup.ingress) {
                securityGroup.ingress.forEach((ingress) => {
                    if (!ingress.description) {
                        reportViolation("EC2 Security Groups Ingress rules should have a description.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "low",
    topics: ["documentation"],
});

/**
 * Checks that all Egress Security Groups rules have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/working-with-security-groups.html
 */
export const missingEgressRuleDescription: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-securitygroup-missing-egress-rule-description",
        description: "Checks that all Egress Security Groups rules have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (securityGroup, args, reportViolation) => {
            if (securityGroup.egress) {
                securityGroup.egress.forEach((ingress) => {
                    if (!ingress.description) {
                        reportViolation("EC2 Security Groups Egress rules should have a description.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "low",
    topics: ["documentation"],
});

/**
 * Check that EC2 Security Groups do not allow inbound HTTP traffic.
 *
 * @severity Critical
 * @link https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
 */
export const disallowInboundHttpTraffic: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-securitygroup-disallow-inbound-http-traffic",
        description: "Check that EC2 Security Groups do not allow inbound HTTP traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (securityGroup, args, reportViolation) => {
            if (securityGroup.ingress) {
                securityGroup.ingress.forEach((ingress) => {
                    if (ingress.protocol.toLowerCase() === "tcp" && (ingress.fromPort === 80 || ingress.toPort === 80)) {
                        reportViolation("EC2 Security Groups should not allow ingress HTTP traffic.");
                    }
                    if (ingress.protocol.toLowerCase() === "tcp" && (ingress.fromPort < 80 && ingress.toPort > 80)) {
                        reportViolation("EC2 Security Groups should not allow ingress HTTP traffic.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "critical",
    topics: ["network", "encryption"],
});

/**
 * Check that EC2 Security Groups do not allow ingress traffic from the Internet.
 *
 * @severity Critical
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules-reference.html
 */
export const disallowPublicInternetIngress: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-securitygroup-disallow-public-internet-ingress",
        description: "Check that EC2 Security Groups do not allow ingress traffic from the Internet.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (securityGroup, _, reportViolation) => {
            if (securityGroup.ingress) {
                if (securityGroup.ingress.some(ingressRule => ingressRule.cidrBlocks?.includes("0.0.0.0/0"))) {
                    reportViolation("EC2 Security Groups should not permit ingress traffic from the public internet (0.0.0.0/0).");
                }
                if (securityGroup.ingress.some(ingressRule => ingressRule.ipv6CidrBlocks?.includes("::/0"))) {
                    reportViolation("EC2 Security Groups should not permit ingress traffic from the public internet (::/0).");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "critical",
    topics: ["network"],
});
