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
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that RDS DB Instances public access is not enabled.
 *
 * @severity critical
 * @frameworks hitrust, iso27001, pcidss
 * @topics network
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.Connect.html
 */
export const disallowPublicAccess: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbinstance-disallow-public-access",
        description: "Checks that RDS DB Instances public access is not enabled.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(DbInstance, (dbInstance, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (dbInstance.publiclyAccessible) {
                reportViolation("RDS DB Instances public access should not be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "critical",
    topics: ["network"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
