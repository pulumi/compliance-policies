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

import { Secret } from "@pulumi/aws/secretsmanager";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Check that Secrets Manager Secrets use a customer-manager KMS key.
 *
 * @severity low
 * @frameworks iso27001, pcidss
 * @topics encryption
 * @link https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-secretsmanager-secret-configure-customer-managed-key",
        description: "Check that Secrets Manager Secrets use a customer-manager KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Secret, (secret, args, reportViolation) => {
            if (!secret.kmsKeyId) {
                reportViolation("Secrets Manager Secrets should be encrypted using a customer-managed KMS key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["secretsmanager"],
    severity: "low",
    topics: ["encryption"],
    frameworks: ["pcidss", "iso27001"],
});
