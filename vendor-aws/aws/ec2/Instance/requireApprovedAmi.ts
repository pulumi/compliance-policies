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

import { Instance } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Ensures that only approved AMIs are used for EC2 instances.
 *
 * @severity high
 * @frameworks cis
 * @topics security, compliance
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/finding-an-ami.html
 */
export const requireApprovedAmi: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-instance-require-approved-ami",
        description: "Ensures that only AMIs from an approved list are used for EC2 instances.",
        configSchema: {
            ...policyManager.policyConfigSchema,
            properties: {
                ...policyManager.policyConfigSchema.properties,
                approvedAmis: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of approved AMI IDs. If empty, all AMIs will be flagged.",
                },
                approvedAmiPatterns: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of regular expression patterns for approved AMI IDs. If empty, no patterns will be considered.",
                },
            },
        },
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Instance, (instance, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            const { approvedAmis = [], approvedAmiPatterns = [] } = args.getConfig<{
                approvedAmis?: string[];
                approvedAmiPatterns?: string[];
            }>() || {};

            // If no config is provided, warn that the policy needs configuration
            if (approvedAmis.length === 0 && approvedAmiPatterns.length === 0) {
                reportViolation(
                    "No approved AMIs are configured. Configure 'approvedAmis' or 'approvedAmiPatterns' policy parameter."
                );
                return;
            }

            const instanceAmi = instance.ami;
            if (!instanceAmi) {
                return;
            }

            // Check if the AMI is in the approved list
            if (approvedAmis.includes(instanceAmi)) {
                return;
            }

            // Check if the AMI matches any of the approved patterns
            const isApprovedPattern = approvedAmiPatterns.some((pattern) => {
                try {
                    const regex = new RegExp(pattern);
                    return regex.test(instanceAmi);
                } catch (e) {
                    // If the pattern is invalid, skip it
                    return false;
                }
            });

            if (!isApprovedPattern) {
                reportViolation(
                    `EC2 instance is using an unapproved AMI (${instanceAmi}). Only approved AMIs should be used.`
                );
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["security", "compliance"],
    frameworks: ["cis"],
});
