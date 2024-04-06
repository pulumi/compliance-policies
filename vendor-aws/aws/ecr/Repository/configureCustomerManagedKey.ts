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

import { Repository } from "@pulumi/aws/ecr";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that ECR repositories use a customer-managed KMS key.
 *
 * @severity low
 * @frameworks hitrust, iso27001, pcidss
 * @topics container, encryption, storage
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/encryption-at-rest.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecr-repository-configure-customer-managed-key",
        description: "Checks that ECR repositories use a customer-managed KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Repository, (repo, args, reportViolation) => {
            if (repo.encryptionConfigurations) {
                repo.encryptionConfigurations.forEach((encryptionConfiguration) => {
                    if (!encryptionConfiguration.encryptionType || encryptionConfiguration.encryptionType.toLowerCase() === "AES256".toLowerCase()) {
                        reportViolation("ECR repositories should be encrypted using a customer-managed KMS key.");
                    } else {
                        if (encryptionConfiguration.encryptionType.toLowerCase() === "KMS".toLowerCase() && !encryptionConfiguration.kmsKey) {
                            reportViolation("ECR repositories should be encrypted using a customer-managed KMS key.");
                        }
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecr"],
    severity: "low",
    topics: ["container", "encryption", "storage"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
