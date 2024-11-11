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

import { Bucket } from "@pulumi/gcp/storage/bucket";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Check that Storage Bucket Public Access Prevention is enforced.
 *
 * @severity critical
 * @frameworks cis, iso27001, pcidss
 * @topics security, storage
 * @link https://cloud.google.com/storage/docs/public-access-prevention
 */
export const enforcePublicAccessPrevention: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "gcp-storage-bucket-enforce-public-access-prevention",
        description: "Check that Storage Bucket Public Access Prevention is enforced.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Bucket, (bucket, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (bucket.publicAccessPrevention) {
                if (bucket.publicAccessPrevention.toLowerCase() !== "enforced") {
                    reportViolation("Storage Buckets should set the Public Access Prevent to 'enforced'.");
                }
            } else {
                // Implicitly set as `inherited`
                reportViolation("Storage Buckets should set the Public Access Prevent to 'enforced'.");
            }
        }),
    },
    vendors: ["google"],
    services: ["storage"],
    severity: "critical",
    topics: ["storage", "security"],
    frameworks: ["iso27001", "pcidss", "cis"],
});
