// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that ECR repositories have 'scan-on-push' configured.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html
 */
export const configureImageScan: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecr-repository-configure-image-scan",
        description: "Checks that ECR repositories have 'scan-on-push' configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
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
export const enableImageScan: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecr-repository-enable-image-scan",
        description: "Checks that ECR repositories have 'scan-on-push' enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
            if (repo.imageScanningConfiguration && !repo.imageScanningConfiguration.scanOnPush) {
                reportViolation("ECR Repositories should enable 'scan-on-push'.");
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
 * Checks that ECR Repositories have immutable images enabled.
 *
 * @severity High
 * @link https://sysdig.com/blog/toctou-tag-mutability/
 */
export const disallowMutableImage: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecr-repository-disallow-mutable-image",
        description: "Checks that ECR Repositories have immutable images enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
            if (repo.imageTagMutability !== "IMMUTABLE") {
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
export const disallowUnencryptedRepository: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecr-repository-disallow-unencrypted-repository",
        description: "Checks that ECR Repositories are encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
            if (repo.encryptionConfigurations === undefined) {
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
export const configureCustomerManagedKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecr-repository-configure-customer-managed-key",
        description: "Checks that ECR repositories use a customer-managed KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
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
});
