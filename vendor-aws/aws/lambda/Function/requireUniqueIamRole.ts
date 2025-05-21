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

import { Function } from "@pulumi/aws/lambda";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that every Lambda function has its own unique IAM execution role.
 *
 * @severity high
 * @frameworks cis
 * @topics security, access-control, principle-of-least-privilege
 * @link https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html
 */
export const requireUniqueIamRole: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-lambda-function-require-unique-iam-role",
        description: "Ensures that each Lambda function uses a unique/exclusive IAM execution role to enforce the principle of least privilege and prevent privilege overlap.",
        configSchema: {
            ...policyManager.policyConfigSchema,
            properties: {
                ...policyManager.policyConfigSchema.properties,
                exemptRoleNames: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of IAM role names that are exempt from the unique role requirement. These should be used sparingly and only for specific use cases.",
                },
                exemptRolePatterns: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of regex patterns for IAM role names that are exempt from the unique role requirement.",
                },
            },
        },
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Function, (lambdaFunction, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            // Get the configured exempt roles and patterns
            const {
                exemptRoleNames = [],
                exemptRolePatterns = [],
            } = args.getConfig<{
                exemptRoleNames?: string[];
                exemptRolePatterns?: string[];
            }>() || {};

            // Check if the Lambda function has a role defined
            if (!lambdaFunction.role) {
                reportViolation("Lambda function does not have an execution role specified.");
                return;
            }

            const roleArn = lambdaFunction.role;

            // Extract the role name from the ARN
            const roleName = roleArn.split("/").pop();

            if (!roleName) {
                reportViolation("Could not determine role name from ARN.");
                return;
            }

            // Check if the role is in the exempt list
            if (exemptRoleNames.includes(roleName)) {
                return;
            }

            // Check if the role matches any exempt pattern
            for (const pattern of exemptRolePatterns) {
                try {
                    const regex = new RegExp(pattern);
                    if (regex.test(roleName)) {
                        return;
                    }
                } catch (e) {
                    // If the pattern is invalid, skip it
                    continue;
                }
            }

            // Check for naming patterns that suggest shared roles
            const sharedRolePatterns = [
                /^lambda-shared/i,
                /^shared-lambda/i,
                /^common-lambda/i,
                /^lambda-common/i,
                /^default-lambda/i,
                /^lambda-default/i,
                /^lambda-exec-role$/i,
                /^LambdaExecutionRole$/i,
                /^LambdaBasicExecution$/i,
                /^AWSLambdaBasicExecution/i,
            ];

            for (const pattern of sharedRolePatterns) {
                if (pattern.test(roleName)) {
                    reportViolation(
                        `Lambda function appears to be using a shared IAM role '${roleName}'. Each Lambda function should have its own dedicated IAM role following the principle of least privilege.`
                    );
                    return;
                }
            }

            // Advisory message about verifying uniqueness across the account
            reportViolation(
                `Please ensure that the IAM role '${roleName}' is dedicated to this Lambda function and not shared with other functions. ` +
                `Sharing roles between Lambda functions can lead to excessive permissions and violate the principle of least privilege.`
            );
        }),
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "high",
    topics: ["security", "access-control", "principle-of-least-privilege"],
    frameworks: ["cis"],
});
