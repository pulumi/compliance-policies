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

import { Bucket } from "@pulumi/aws/s3";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that S3 Bucket ACLs don't allow 'public-read' or 'public-read-write' or 'authenticated-read'.
 *
 * @severity critical
 * @frameworks cis, hitrust, iso27001, pcidss
 * @topics security, storage
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
 */
export const disallowPublicRead: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-s3-bucket-disallow-public-read",
        description: "Checks that S3 Bucket ACLs don't allow 'public-read' or 'public-read-write' or 'authenticated-read'.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Bucket, (bucket, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (bucket.acl) {
                if (bucket.acl.toLowerCase() === "public-read" || bucket.acl.toLowerCase() === "public-read-write" || bucket.acl.toLowerCase() === "authenticated-read") {
                    reportViolation("S3 Buckets ACLs should not be set to 'public-read', 'public-read-write' or 'authenticated-read'.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "critical",
    topics: ["storage", "security"],
    frameworks: ["cis", "pcidss", "hitrust", "iso27001"],
});
