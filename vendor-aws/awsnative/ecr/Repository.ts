// Copyright 2016-2023, Pulumi Corporation.
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

import * as awsnative from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that ECR repositories have 'scan-on-push' configured.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html
 */
export const configureImageScan: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-ecr-repository-configure-image-scan",
        description: "Checks that ECR repositories have 'scan-on-push' configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.ecr.Repository, (repo, args, reportViolation) => {
            if (!repo.imageScanningConfiguration) {
                reportViolation("ECR Repositories should have image scanning configured.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container", "vulnerability"],
    frameworks: ["soc2", "pcidss"],
});

/**
 * Checks that ECR repositories have 'scan-on-push' enabled.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html
 */
export const enableImageScan: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-ecr-repository-enable-image-scan",
        description: "Checks that ECR repositories have 'scan-on-push' enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.ecr.Repository, (repo, args, reportViolation) => {
            if (repo.imageScanningConfiguration && !repo.imageScanningConfiguration.scanOnPush) {
                reportViolation("ECR Repositories should enable 'scan-on-push'.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container", "vulnerability"],
});

/**
 * Checks that ECR Repositories have immutable images enabled.
 *
 * @severity High
 * @link https://sysdig.com/blog/toctou-tag-mutability/
 */
export const disallowMutableImage: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-ecr-repository-disallow-mutable-image",
        description: "Checks that ECR Repositories have immutable images enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.ecr.Repository, (repo, args, reportViolation) => {
            if (repo.imageTagMutability !== awsnative.ecr.RepositoryImageTagMutability.Immutable) {
                reportViolation("ECR repositories should enable immutable images.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container"],
});

/**
 * Checks that ECR Repositories are encrypted.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/encryption-at-rest.html
 */
export const disallowUnencryptedRepository: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-ecr-repository-disallow-unencrypted-repository",
        description: "Checks that ECR Repositories are encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.ecr.Repository, (repo, args, reportViolation) => {
            if (repo.encryptionConfiguration === undefined) {
                reportViolation("ECR repositories should be encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container", "encryption", "storage"],
});

/**
 * Checks that ECR repositories use a customer-managed KMS key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/encryption-at-rest.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-ecr-repository-configure-customer-managed-key",
        description: "Checks that ECR repositories use a customer-managed KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.ecr.Repository, (repo, args, reportViolation) => {
            if (repo.encryptionConfiguration) {
                if (repo.encryptionConfiguration.encryptionType !== awsnative.ecr.RepositoryEncryptionType.Kms) {
                    reportViolation("ECR repositories should be encrypted using a customer-managed KMS key.");
                }
                if (repo.encryptionConfiguration.encryptionType === awsnative.ecr.RepositoryEncryptionType.Kms && !repo.encryptionConfiguration.kmsKey) {
                    reportViolation("ECR repositories should be encrypted using a customer-managed KMS key.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecr"],
    severity: "low",
    topics: ["container", "encryption", "storage"],
});
