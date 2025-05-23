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

import { Secret } from "@pulumi/aws/secretsmanager";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that Secrets Manager Secrets have a description.
 *
 * @severity low
 * @frameworks none
 * @topics documentation
 * @link https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html
 */
export const missingDescription: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-secretsmanager-secret-missing-description",
        description: "Checks that Secrets Manager Secrets have a description.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Secret, (secret, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (!secret.description) {
                reportViolation("Secrets Manager Secrets should have a description.");
            } else {
                if (secret.description.length < 6) {
                    reportViolation("Secrets Manager Secrets should have a meaningful description.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["secretsmanager"],
    severity: "low",
    topics: ["documentation"],
});
