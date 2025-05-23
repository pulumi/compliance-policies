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

import { Bucket } from "@pulumi/aws/s3";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Check that S3 Buckets Server-Side Encryption (SSE) is using a Bucket key.
 *
 * @severity medium
 * @frameworks iso27001, pcidss
 * @topics cost, encryption, storage
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-key.html
 */
export const enableServerSideEncryptionBucketKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-enable-server-side-encryption-bucket-key",
        description: "Check that S3 Buckets Server-Side Encryption (SSE) is using a Bucket key.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Bucket, (bucket, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (bucket.serverSideEncryptionConfiguration && bucket.serverSideEncryptionConfiguration.rule.bucketKeyEnabled !== true) {
                reportViolation("S3 Buckets Server-Side Encryption (SSE) should use a Bucket key to reduce cost.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "medium",
    topics: ["encryption", "storage", "cost"],
    frameworks: ["pcidss", "iso27001"],
});
