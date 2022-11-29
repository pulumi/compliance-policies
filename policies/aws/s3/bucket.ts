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
 * Prohibits setting the publicRead or publicReadWrite permission on AWS S3 buckets.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
 */
export const noPublicRead: ResourceValidationPolicy = {
    name: "aws-s3-bucket-no-public-read",
    description: "Prohibits setting the publicRead or publicReadWrite permission on AWS S3 buckets.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
        if (bucket.acl === "public-read" || bucket.acl === "public-read-write") {
            reportViolation(
                "You cannot set public-read or public-read-write on an S3 bucket.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: noPublicRead,
    vendors: ["aws"],
    services: ["s3"],
    severity: "critical",
    topics: ["storage", "security"],
});

/**
 * Encourages use of cross-region replication for S3 buckets.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html
 */
export const replicationEnabled: ResourceValidationPolicy = {
    name: "aws-s3-bucket-replication-enabled",
    description: "Encourages use of cross-region replication for S3 buckets.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
        if (!bucket.replicationConfiguration) {
            reportViolation("S3 buckets should have cross-region replication.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: replicationEnabled,
    vendors: ["aws"],
    services: ["s3"],
    severity: "high",
    topics: ["availability"],
});

/**
 * Check that Server-Side Encryption (SSE) is enabled on S3 buckets.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html
 */
export const serverSideEncryption: ResourceValidationPolicy = {
    name: "aws-s3-bucket-server-side-encryption",
    description: "Check that Server-Side Encryption (SSE) is enabled on S3 buckets.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
        if (bucket.serverSideEncryptionConfiguration === undefined) {
            reportViolation("S3 buckets should have server-side encryption enabled.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: serverSideEncryption,
    vendors: ["aws"],
    services: ["s3"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Check that Server-Side Encryption (SSE) is enabled on S3 buckets using KMS.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html
 */
export const serverSideEncryptionKMS: ResourceValidationPolicy = {
    name: "aws-s3-bucket-server-side-encryption-kms",
    description: "Check that Server-Side Encryption (SSE) is enabled on S3 buckets using KMS.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
        if (bucket.serverSideEncryptionConfiguration?.rule.applyServerSideEncryptionByDefault.sseAlgorithm.toLowerCase() !== "aws:kms".toLowerCase()) {
            reportViolation("S3 buckets should have server-side encryption enabled using KMS.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: serverSideEncryptionKMS,
    vendors: ["aws"],
    services: ["s3"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Check that Server-Side Encryption (SSE) is enabled on S3 buckets using a customer managed Key.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/specifying-kms-encryption.html
 */
export const serverSideEncryptionKMSWithCustomerManagedKey: ResourceValidationPolicy = {
    name: "aws-s3-bucket-server-side-encryption-customer-managed-key",
    description: "Check that Server-Side Encryption (SSE) is enabled on S3 buckets using a customer managed Key.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
        if (bucket.serverSideEncryptionConfiguration?.rule.applyServerSideEncryptionByDefault.kmsMasterKeyId === undefined) {
            reportViolation("S3 buckets should have server-side encryption enabled using a customer managed KMS key.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: serverSideEncryptionKMSWithCustomerManagedKey,
    vendors: ["aws"],
    services: ["s3"],
    severity: "low",
    topics: ["encryption", "storage"],
});

/**
 * Check that Server-Side Encryption (SSE) is enabled on S3 buckets using a bucket key.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-key.html
 */
export const serverSideEncryptionBucketKey: ResourceValidationPolicy = {
    name: "aws-s3-bucket-server-side-encryption-with-bucket-key",
    description: "Check that Server-Side Encryption (SSE) is enabled on S3 buckets using a bucket key.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
        if (bucket.serverSideEncryptionConfiguration?.rule.bucketKeyEnabled !== true) {
            reportViolation("S3 buckets should have server-side encryption enabled using a bucket key to reduce cost.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: serverSideEncryptionBucketKey,
    vendors: ["aws"],
    services: ["s3"],
    severity: "medium",
    topics: ["encryption", "storage", "cost"],
});
