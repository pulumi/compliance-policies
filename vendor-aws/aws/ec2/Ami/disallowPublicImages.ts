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

import { Ami } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that Amazon Machine Images (AMIs) are not shared publicly.
 *
 * @severity high
 * @frameworks cis, pcidss
 * @topics security, compliance
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/sharingamis-intro.html
 */
export const disallowPublicImages: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-ami-disallow-public-images",
        description: "Ensures that Amazon Machine Images (AMIs) are not shared publicly.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Ami, (ami, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            // Check if the AMI is set to be publicly available
            if (ami.public === true) {
                reportViolation(
                    "AMIs should not be publicly available. Set 'public' to false and use specific account sharing instead."
                );
            }

            // Also check LaunchPermissions for public access
            if (ami.imageLocation) {
                const hasLaunchPermissions = ami.imagePermissions || [];
                
                // Check if any permission grants to 'all' (public)
                for (const permission of hasLaunchPermissions) {
                    if (permission.group === "all") {
                        reportViolation(
                            "AMI has launch permissions for the 'all' group, making it publicly available. Remove public permissions."
                        );
                        break;
                    }
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["security", "compliance"],
    frameworks: ["cis", "pcidss"],
});