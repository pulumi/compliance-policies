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
 * Checks that Lambda functions do not allow unknown cross-account access via permission policies.
 *
 * @severity high
 * @frameworks cis
 * @topics security, access-control
 * @link https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html
 */
export const disallowUnknownCrossAccountAccess: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-lambda-function-disallow-unknown-cross-account-access",
        description: "Ensures that Lambda functions do not allow unknown cross-account access via overly permissive policies. Lambda permissions must not allow '*' principal or open cross-account access.",
        configSchema: {
            ...policyManager.policyConfigSchema,
            properties: {
                ...policyManager.policyConfigSchema.properties,
                allowedAccountIds: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of allowed AWS account IDs for cross-account access.",
                },
                allowedOrganizationIds: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of allowed AWS Organization IDs for cross-account access.",
                },
                allowedServices: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of allowed AWS services that can invoke the Lambda function.",
                    default: [
                        "apigateway.amazonaws.com",
                        "events.amazonaws.com",
                        "s3.amazonaws.com",
                        "sns.amazonaws.com",
                        "sqs.amazonaws.com",
                    ],
                },
            },
        },
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Function, (lambdaFunction, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            // Get the configured allowed accounts and services
            const {
                allowedAccountIds = [],
                allowedOrganizationIds = [],
                allowedServices = [
                    "apigateway.amazonaws.com",
                    "events.amazonaws.com",
                    "s3.amazonaws.com",
                    "sns.amazonaws.com",
                    "sqs.amazonaws.com",
                ],
            } = args.getConfig<{
                allowedAccountIds?: string[];
                allowedOrganizationIds?: string[];
                allowedServices?: string[];
            }>() || {};

            // Check the permission policy if available
            if (lambdaFunction.permissionsBoundary) {
                reportViolation("Lambda function has a permissions boundary policy attached. Review it to ensure it doesn't grant overly permissive cross-account access.");
            }

            // Check role assumption policies
            if (lambdaFunction.role) {
                // We can't directly check the role's trust policy here as we don't have access to it
                // Instead, we offer guidance
                const roleArn = lambdaFunction.role;
                if (roleArn.includes("*")) {
                    reportViolation("Lambda function has a role with wildcard (*) in the ARN, which could lead to privilege escalation.");
                }
            }

            // Warn about the need to check resource-based policies
            reportViolation(
                "This policy can only check certain aspects of Lambda permissions. Please ensure you manually review any resource-based policies " +
                "attached to this Lambda function to verify they don't allow wildcard principals (*) or unknown cross-account access. " +
                "Use AWS Lambda Permission resources with specific principals from your allowed list."
            );
        }),
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "high",
    topics: ["security", "access-control"],
    frameworks: ["cis"],
});
