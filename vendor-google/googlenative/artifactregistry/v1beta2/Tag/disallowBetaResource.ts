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
import { Tag } from "@pulumi/google-native/artifactregistry/v1beta2";

/**
 * Disallow the use of non-stable (Beta) resouces (artifactregistry.v1beta2.Tag).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-artifactregistry-v1beta2-tag-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (artifactregistry.v1beta2.Tag).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Tag, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Artifactregistry Tag shouldn't use an unstable API (artifactregistry.v1beta2.Tag).");
        }),
    },
    vendors: ["google"],
    services: ["artifactregistry"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
