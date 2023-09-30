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

import { SecurityGroup } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Check that EC2 Security Groups do not allow inbound HTTP traffic.
 *
 * @severity critical
 * @frameworks iso27001, pcidss
 * @topics encryption, network
 * @link https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
 */
export const disallowInboundHttpTraffic: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-securitygroup-disallow-inbound-http-traffic",
        description: "Check that EC2 Security Groups do not allow inbound HTTP traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(SecurityGroup, (securityGroup, args, reportViolation) => {
            if (securityGroup.ingress) {
                securityGroup.ingress.forEach((ingress) => {
                    if (ingress.protocol.toLowerCase() === "tcp" && (ingress.fromPort === 80 || ingress.toPort === 80)) {
                        reportViolation("EC2 Security Groups should not allow ingress HTTP traffic.");
                    }
                    if (ingress.protocol.toLowerCase() === "tcp" && ingress.fromPort < 80 && ingress.toPort > 80) {
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
    frameworks: ["pcidss", "iso27001"],
});
