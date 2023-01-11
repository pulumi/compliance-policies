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
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that S3 Bucket ACLs don't allow 'public-read' or 'public-read-write' or 'authenticated-read'.
 *
 * @severity Critical
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
 */
export const disallowPublicRead: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-disallow-public-read",
        description: "Checks that S3 Bucket ACLs don't allow 'public-read' or 'public-read-write' or 'authenticated-read'.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
            if (bucket.acl) {
                if (
                    bucket.acl.toLowerCase() === "public-read" ||
                    bucket.acl.toLowerCase() === "public-read-write" ||
                    bucket.acl.toLowerCase() === "authenticated-read") {
                    reportViolation("S3 Buckets ACLs should not be set to 'public-read', 'public-read-write' or 'authenticated-read'.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "critical",
    topics: ["storage", "security"],
});

/**
 * Checks that S3 Bucket have cross-region replication enabled.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html
 */
export const enableReplicationConfiguration: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-enable-replication-configuration",
        description: "Checks that S3 Bucket have cross-region replication enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
            if (
                !bucket.replicationConfiguration ||
                !bucket.replicationConfiguration.rules ||
                bucket.replicationConfiguration.rules.length < 1) {
                reportViolation("S3 buckets should have cross-region replication enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "high",
    topics: ["availability"],
});

/**
 * Checks that S3 Bucket have cross-region replication configured.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html
 */
export const configureReplicationConfiguration: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-configure-replication-configuration",
        description: "Checks that S3 Bucket have cross-region replication configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
            if (bucket.replicationConfiguration && bucket.replicationConfiguration.rules) {
                bucket.replicationConfiguration.rules.forEach((rule) => {
                    if (rule.status.toLowerCase() !== "enabled") {
                        reportViolation("S3 Buckets replication rules should be configured.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "high",
    topics: ["availability"],
});

/**
 * Check that S3 Bucket Server-Side Encryption (SSE) is enabled.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html
 */
export const enableServerSideEncryption: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-enable-server-side-encryption",
        description: "Check that S3 Bucket Server-Side Encryption (SSE) is enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
            if (!bucket.serverSideEncryptionConfiguration) {
                reportViolation("S3 Buckets Server-Side Encryption (SSE) should be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Check that S3 Buckets Server-Side Encryption (SSE) uses AWS KMS.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html
 */
export const configureServerSideEncryptionKms: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-configure-server-side-encryption-kms",
        description: "Check that S3 Buckets Server-Side Encryption (SSE) uses AWS KMS.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
            if (bucket.serverSideEncryptionConfiguration && bucket.serverSideEncryptionConfiguration.rule.applyServerSideEncryptionByDefault.sseAlgorithm.toLowerCase() !== "aws:kms") {
                reportViolation("S3 Buckets Server-Side Encryption (SSE) should use AWS KMS.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Check that S3 Buckets Server-Side Encryption (SSE) is using a customer-managed KMS Key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/specifying-kms-encryption.html
 */
export const configureServerSideEncryptionCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-configure-server-side-encryption-customer-managed-key",
        description: "Check that S3 Buckets Server-Side Encryption (SSE) is using a customer-managed KMS Key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
            if (bucket.serverSideEncryptionConfiguration && !bucket.serverSideEncryptionConfiguration.rule.applyServerSideEncryptionByDefault.kmsMasterKeyId) {
                reportViolation("S3 Buckets Server-Side Encryption (SSE) should use a Customer-managed KMS key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "low",
    topics: ["encryption", "storage"],
});

/**
 * Check that S3 Buckets Server-Side Encryption (SSE) is using a Bucket key.
 *
 * @severity Medium
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-key.html
 */
export const enableServerSideEncryptionBucketKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-enable-server-side-encryption-bucket-key",
        description: "Check that S3 Buckets Server-Side Encryption (SSE) is using a Bucket key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
            if (bucket.serverSideEncryptionConfiguration && bucket.serverSideEncryptionConfiguration.rule.bucketKeyEnabled !== true) {
                reportViolation("S3 Buckets Server-Side Encryption (SSE) should use a Bucket key to reduce cost.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "medium",
    topics: ["encryption", "storage", "cost"],
});
