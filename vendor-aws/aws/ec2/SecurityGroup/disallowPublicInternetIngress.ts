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
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Check that EC2 Security Groups do not allow ingress traffic from the Internet.
 *
 * @severity critical
 * @frameworks hitrust, iso27001, pcidss
 * @topics network
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules-reference.html
 */
export const disallowPublicInternetIngress: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-securitygroup-disallow-public-internet-ingress",
        description: "Check that EC2 Security Groups do not allow ingress traffic from the Internet.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(SecurityGroup, (securityGroup, _, reportViolation) => {
            if (securityGroup.ingress) {
                if (securityGroup.ingress.some((ingressRule) => ingressRule.cidrBlocks?.includes("0.0.0.0/0"))) {
                    reportViolation("EC2 Security Groups should not permit ingress traffic from the public internet (0.0.0.0/0).");
                }
                if (securityGroup.ingress.some((ingressRule) => ingressRule.ipv6CidrBlocks?.includes("::/0"))) {
                    reportViolation("EC2 Security Groups should not permit ingress traffic from the public internet (::/0).");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "critical",
    topics: ["network"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
