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
import { Hl7V2Store } from "@pulumi/google-native/healthcare/v1beta1";

/**
 * Disallow the use of non-stable (Beta) resouces (healthcare.v1beta1.Hl7V2Store).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-healthcare-v1beta1-hl7v2store-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (healthcare.v1beta1.Hl7V2Store).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Hl7V2Store, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Healthcare Hl7V2Store shouldn't use an unstable API (healthcare.v1beta1.Hl7V2Store).");
        }),
    },
    vendors: ["google"],
    services: ["healthcare"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
