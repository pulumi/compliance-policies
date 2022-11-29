// Copyright 2016-2022, Pulumi Corporation.
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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyRegistrations } from "../../utils";

/**
 * Checks that ECR repositories have 'scan-on-push' configured.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html
 */
export const configureImageScan: ResourceValidationPolicy = {
    name: "aws-ecr-repository-configure-image-scans",
    description: "Checks that ECR repositories have 'scan-on-push' configured.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (!repo.imageScanningConfiguration) {
            reportViolation("ECR Repositories should have image scanning configured.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: configureImageScan,
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container", "vulnerability"],
    frameworks: ["soc2", "pcidss"],
});

/**
 * Checks that ECR repositories have 'scan-on-push' enabled.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html
 */
export const enableImageScan: ResourceValidationPolicy = {
    name: "aws-ecr-repository-enable-image-scans",
    description: "Checks that ECR repositories have 'scan-on-push' enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (repo.imageScanningConfiguration && !repo.imageScanningConfiguration.scanOnPush) {
            reportViolation("ECR Repositories should enable 'scan-on-push'.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: enableImageScan,
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container", "vulnerability"],
});

/**
 * Checks that ECR repositories have immutable images enabled.
 *
 * @severity **High**
 * @link https://sysdig.com/blog/toctou-tag-mutability/
 */
export const disallowMutableImage: ResourceValidationPolicy = {
    name: "aws-ecr-repository-disallow-mutable-images",
    description: "Checks that ECR Repositories have immutable images enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (repo.imageTagMutability !== "IMMUTABLE") {
            reportViolation("ECR repositories should enable immutable images.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: disallowMutableImage,
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container"],
});

/**
 * Checks that no ECR repositories is unencrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/encryption-at-rest.html
 */
export const disallowUnencryptedRepository: ResourceValidationPolicy = {
    name: "aws-ecr-repository-disallow-unencrypted-repository",
    description: "Checks that ECR Repositories are encrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (repo.encryptionConfigurations === undefined) {
            reportViolation("ECR repositories should be encrypted.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: disallowUnencryptedRepository,
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container", "encryption", "storage"],
});

/**
 * Checks that ECR repositories use a customer-manager KMS key.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/encryption-at-rest.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = {
    name: "aws-ecr-repository-configure-customer-managed-key",
    description: "Checks that ECR repositories use a customer-manager KMS key.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (repo.encryptionConfigurations) {
            repo.encryptionConfigurations.forEach((encryptionConfiguration) => {
                if (encryptionConfiguration.encryptionType?.toLowerCase() === "AES256".toLowerCase()) {
                    reportViolation("ECR repositories should be encrypted using a customer-managed KMS key.");
                }
                if (encryptionConfiguration.encryptionType?.toLowerCase() === "KMS".toLowerCase() && encryptionConfiguration.kmsKey === undefined) {
                    reportViolation("ECR repositories should be encrypted using a customer-managed KMS key.");
                }
            });
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: configureCustomerManagedKey,
    vendors: ["aws"],
    services: ["ecr"],
    severity: "low",
    topics: ["container", "encryption", "storage"],
});
