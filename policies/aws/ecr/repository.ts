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

/**
 * Checks that ECR repositories have scan on push enabled.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html
 */
export const imageScans: ResourceValidationPolicy = {
    name: "aws-ecr-repository-disallow-repo-without-image-scans",
    description: "Checks that ECR repositories have scan on push enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (!repo.imageScanningConfiguration?.scanOnPush) {
            reportViolation("ECR image scanning on push should be enabled.");
        }
    }),
};

/**
 * Checks that ECR repositories have immutable images enabled.
 *
 * @severity **High**
 * @link https://sysdig.com/blog/toctou-tag-mutability/
 */
export const immutableImage: ResourceValidationPolicy = {
    name: "aws-ecr-repository-disallow-repo-without-immutable-image",
    description: "Checks that ECR repositories have immutable images enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (repo.imageTagMutability !== "IMMUTABLE") {
            reportViolation("ECR repositories should have immutable images");
        }
    }),
};

/**
 * Checks that no ECR repositories is unencrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/encryption-at-rest.html
 */
export const noUnencryptedRepository: ResourceValidationPolicy = {
    name: "aws-ecr-repository-disallow-unencrypted-repository",
    description: "Checks that no ECR repositories is unencrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (repo.encryptionConfigurations === undefined) {
            reportViolation("ECR repositories should be encrypted.");
        }
    }),
};

/**
 * Checks that ECR repositories use a customer-manager KMS key.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/encryption-at-rest.html
 */
export const customerManagedKey: ResourceValidationPolicy = {
    name: "aws-ecr-repository-disallow-repository-without-customer-managed-key",
    description: "Checks that ECR repositories use a customer-manager KMS key.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        repo.encryptionConfigurations?.forEach((encryptionConfiguration) => {
            if (encryptionConfiguration.encryptionType?.toLowerCase() === "AES256".toLowerCase()) {
                reportViolation("ECR repositories should be encrypted with a customer-managed KMS key.");
            }
            if (encryptionConfiguration.encryptionType?.toLowerCase() === "KMS".toLowerCase() && encryptionConfiguration.kmsKey === undefined) {
                reportViolation("ECR repositories should be encrypted with a customer-managed KMS key.");
            }
        });
    }),
};
