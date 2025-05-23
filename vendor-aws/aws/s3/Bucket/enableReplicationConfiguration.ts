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
 * Checks that S3 Bucket have cross-region replication enabled.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics availability
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html
 */
export const enableReplicationConfiguration: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-enable-replication-configuration",
        description: "Checks that S3 Bucket have cross-region replication enabled.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Bucket, (bucket, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (!bucket.replicationConfiguration || !bucket.replicationConfiguration.rules || bucket.replicationConfiguration.rules.length < 1) {
                reportViolation("S3 buckets should have cross-region replication enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "high",
    topics: ["availability"],
    frameworks: ["pcidss", "iso27001"],
});
