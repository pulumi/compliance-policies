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

import { LaunchTemplate } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager, valToBoolean } from "@pulumi/compliance-policy-manager";

/**
 * Checks that EC2 Launch Templates do not have public IP addresses.
 *
 * @severity high
 * @frameworks hitrust, iso27001, pcidss
 * @topics network
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-instance-addressing.html
 */
export const disallowPublicIp: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-launchtemplate-disallow-public-ip",
        description: "Checks that EC2 Launch Templates do not have public IP addresses.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(LaunchTemplate, (launchTemplate, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (launchTemplate.networkInterfaces) {
                launchTemplate.networkInterfaces.forEach((iface) => {
                    // see https://github.com/pulumi/pulumi-aws/issues/2257
                    if (valToBoolean(iface.associatePublicIpAddress)) {
                        reportViolation("EC2 Launch templates should not associate a public IP address to an interface.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["network"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
