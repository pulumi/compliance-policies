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

/**
 * Default imports for a policy.
 */
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";
import { RegistrationIamMember } from "@pulumi/google-native/domains/v1alpha2";

/**
 * Disallow the use of non-stable (Alpha) resouces (domains.v1alpha2.RegistrationIamMember).
 *
 * @severity medium
 * @frameworks none
 * @topics alpha, api, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowAlphaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-domains-v1alpha2-registrationiammember-disallow-alpha-resource",
        description: "Disallow the use of non-stable (Alpha) resouces (domains.v1alpha2.RegistrationIamMember).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(RegistrationIamMember, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Domains RegistrationIamMember shouldn't use an unstable API (domains.v1alpha2.RegistrationIamMember).");
        }),
    },
    vendors: ["google"],
    services: ["domains"],
    severity: "medium",
    topics: ["api", "unstable", "alpha"],
});
