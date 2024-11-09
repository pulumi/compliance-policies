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

import { AccountPasswordPolicy } from "@pulumi/aws/iam";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Ensure IAM password policy requires minimum length of 14 or greater.
 *
 * @severity high
 * @frameworks cis
 * @topics vulnerability
 * @link https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_passwords_account-policy.html
 */
export const minimumPasswordLength: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-iam-password-policy-minimum-password-length",
        description: "Ensure IAM password policy requires minimum length of 14 or greater.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(AccountPasswordPolicy, (policy, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (!policy.minimumPasswordLength || policy.minimumPasswordLength < 14) {
                reportViolation("Passwords should be minimal 14 characters long.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["iam"],
    severity: "high",
    topics: ["vulnerability"],
    frameworks: ["cis"],
});
