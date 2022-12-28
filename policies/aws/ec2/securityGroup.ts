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
 * Checks that all security groups have a description.
 *
 * @severity **Low**
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
 * @severity **Low**
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
 * @severity **Low**
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
 * Check that any security group doesn't allow inbound HTTP traffic.
 *
 * @severity **Critical**
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
 * Check that any security group doesn't allow inbound traffic from the Internet.
 *
 * @severity **Critical**
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
