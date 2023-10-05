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

import { DbInstance } from "@pulumi/aws-native/rds";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/policy-manager";

/**
 * Checks that RDS DB Instances performance insights is encrypted.
 *
 * @severity high
 * @frameworks none
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const disallowUnencryptedPerformanceInsights: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbinstance-disallow-unencrypted-performance-insights",
        description: "Checks that RDS DB Instances performance insights is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(DbInstance, (dbInstance, args, reportViolation) => {
            if (dbInstance.enablePerformanceInsights && !dbInstance.performanceInsightsKmsKeyId) {
                reportViolation("RDS DB Instances should have performance insights encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"],
});
