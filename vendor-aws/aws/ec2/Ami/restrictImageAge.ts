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
 * Checks that Amazon Machine Images (AMIs) are not older than the maximum allowed age.
 *
 * @severity medium
 * @frameworks cis
 * @topics security, compliance
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html
 */
export const restrictImageAge: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-ami-restrict-image-age",
        description: "Ensures that Amazon Machine Images (AMIs) are not older than the maximum allowed age.",
        configSchema: {
            ...policyManager.policyConfigSchema,
            properties: {
                ...policyManager.policyConfigSchema.properties,
                maxAgeInDays: {
                    type: "number",
                    default: 90,
                    description: "Maximum allowed age for AMIs in days. Default is 90 days.",
                },
            },
        },
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Ami, (ami, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            const { maxAgeInDays = 90 } = args.getConfig<{
                maxAgeInDays?: number;
            }>() || {};

            // Check if the creation_date is present
            if (!ami.creationDate) {
                reportViolation(
                    "AMI creation date is not available, unable to determine image age. Ensure AMIs have creation dates."
                );
                return;
            }

            // Calculate age in days
            const creationDate = new Date(ami.creationDate);
            const currentDate = new Date();
            const ageInMillis = currentDate.getTime() - creationDate.getTime();
            const ageInDays = ageInMillis / (1000 * 60 * 60 * 24);

            if (ageInDays > maxAgeInDays) {
                reportViolation(
                    `AMI is ${Math.floor(ageInDays)} days old, which exceeds the maximum allowed age of ${maxAgeInDays} days. AMIs should be regularly updated with latest patches and security updates.`
                );
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "medium",
    topics: ["security", "compliance"],
    frameworks: ["cis"],
});