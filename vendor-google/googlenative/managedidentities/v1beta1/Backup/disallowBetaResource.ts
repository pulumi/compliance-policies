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

/**
 * Default imports for a policy.
 */
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";
import { Backup } from "@pulumi/google-native/managedidentities/v1beta1";

/**
 * Disallow the use of non-stable (Beta) resouces (managedidentities.v1beta1.Backup).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-managedidentities-v1beta1-backup-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (managedidentities.v1beta1.Backup).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Backup, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Managedidentities Backup shouldn't use an unstable API (managedidentities.v1beta1.Backup).");
        }),
    },
    vendors: ["google"],
    services: ["managedidentities"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
