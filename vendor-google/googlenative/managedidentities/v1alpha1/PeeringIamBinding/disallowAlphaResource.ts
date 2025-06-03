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
import { PeeringIamBinding } from "@pulumi/google-native/managedidentities/v1alpha1";

/**
 * Disallow the use of non-stable (Alpha) resouces (managedidentities.v1alpha1.PeeringIamBinding).
 *
 * @severity medium
 * @frameworks none
 * @topics alpha, api, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowAlphaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-managedidentities-v1alpha1-peeringiambinding-disallow-alpha-resource",
        description: "Disallow the use of non-stable (Alpha) resouces (managedidentities.v1alpha1.PeeringIamBinding).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(PeeringIamBinding, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Managedidentities PeeringIamBinding shouldn't use an unstable API (managedidentities.v1alpha1.PeeringIamBinding).");
        }),
    },
    vendors: ["google"],
    services: ["managedidentities"],
    severity: "medium",
    topics: ["api", "unstable", "alpha"],
});
