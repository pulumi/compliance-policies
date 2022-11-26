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

/**
 * @description Checks that all security groups have a description.
 */
export const securityGroupMissingDescription: ResourceValidationPolicy = {
    name: "aws-ec2-security-group-missing-desciption",
    description: "Checks that all security groups have a description.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (sg, args, reportViolation) => {
        if (!sg.description) {
            reportViolation("Security group must have a description.");
        }
    }),
};

/**
 * @desciption Check that any security group doesn't allow inbound HTTP traffic.
 */
export const securityGroupProhibitInboundHttpTraffic: ResourceValidationPolicy = {
    name: "aws-ec2-security-group-disallow-inbound-http-traffic",
    description: "Check that any security group doesn't allow inbound HTTP traffic.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (sg, args, reportViolation) => {
        sg.ingress?.forEach((ingress) => {
            if (ingress.protocol.toLowerCase() === "tcp" && (ingress.fromPort === 80 || ingress.toPort === 80)) {
                reportViolation("A security group ingress rule allows inbound HTTP traffic.");
            }
            if (ingress.protocol.toLowerCase() === "tcp" && (ingress.fromPort < 80 && ingress.toPort > 80)) {
                reportViolation("A security group ingress rule allows inbound HTTP traffic.");
            }
        });
    }),
};

/**
 * @description Check that any security group doesn't allow inbound traffic from the Internet.
 */
export const securityGroupProhibitPublicInternetAccess: ResourceValidationPolicy = {
    name: "aws-ec2-security-group-disallow-public-internet",
    description: "Check that any security group doesn't allow ingress traffic from the Internet.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (group, _, reportViolation) => {
        if (group.ingress?.some(ingressRule => ingressRule.cidrBlocks?.includes("0.0.0.0/0"))) {
            reportViolation("Security groups must not permit ingress traffic from the public internet (0.0.0.0/0).");
        }
        if (group.ingress?.some(ingressRule => ingressRule.ipv6CidrBlocks?.includes("::/0"))) {
            reportViolation("Security groups must not permit ingress traffic from the public internet (::/0).");
        }
    }),
};
