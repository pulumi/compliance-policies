// Copyright 2016-2025, Pulumi Corporation.
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
 * Checks if default security groups of VPCs allow inbound or outbound traffic.
 *
 * @severity high
 * @frameworks cis, nist800-53, pcidss
 * @topics network, security
 * @link https://docs.aws.amazon.com/config/latest/developerguide/vpc-default-security-group-closed.html
 */
export const disallowIngressEgress: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-vpc-defaultsecuritygroup-disallow-ingress-egress",
        description: "Checks if default security groups of VPCs allow inbound or outbound traffic.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(SecurityGroup, (securityGroup, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            const isDefaultSecurityGroup = securityGroup.name === "default" || securityGroup.namePrefix === "default";

            if (!isDefaultSecurityGroup) {
                return;
            }

            if (securityGroup.ingress && securityGroup.ingress.length > 0) {
                reportViolation(
                    "Default security group should not have any inbound traffic rules. " +
					"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-default-security-group-closed.html"
                );
            }

            if (securityGroup.egress && securityGroup.egress.length > 0) {
                reportViolation(
                    "Default security group should not have any outbound traffic rules. " +
					"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-default-security-group-closed.html"
                );
            }
        }),
    },
    vendors: ["aws"],
    services: ["vpc"],
    severity: "high",
    topics: ["network", "security"],
    frameworks: ["cis", "nist800-53", "pcidss"],
});
