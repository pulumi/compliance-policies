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

            // Check if the Lambda function has a role
            if (lambdaFunction.role) {
                // Check role ARN for wildcards
                const roleArn = lambdaFunction.role;
                if (roleArn.includes("*")) {
                    reportViolation("Lambda function has a role with wildcard (*) in the ARN, which could lead to privilege escalation.");
                }

                // Extract account ID from role ARN if possible
                const arnParts = roleArn.split(":");
                if (arnParts.length >= 5) {
                    const accountId = arnParts[4];
                    // Check if the role is from a different account that's not in the allowed list
                    if (accountId && accountId !== "aws" && !allowedAccountIds.includes(accountId)) {
                        reportViolation(`Lambda function uses a role from account ${accountId} which is not in the allowed accounts list.`);
                    }
                }
            } else {
                reportViolation("Lambda function doesn't have a role specified. Each Lambda function should have a specific IAM role with least privilege.");
            }

            // Guidance for resource-based policies
            reportViolation(
                "Lambda function permissions are primarily controlled through resource-based policies. " +
                            "Use 'aws.lambda.Permission' resources to explicitly manage access to this Lambda function. " +
                            "When configuring Lambda Permissions, ensure principals are specific and from allowed accounts only."
            );
        }),
    },
    vendors: ["aws"],
    services: ["lambda"],
    severity: "high",
    topics: ["security", "access-control"],
    frameworks: ["cis"],
});
