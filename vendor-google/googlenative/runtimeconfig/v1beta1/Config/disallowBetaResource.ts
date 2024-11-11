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
import { Config } from "@pulumi/google-native/runtimeconfig/v1beta1";

/**
 * Disallow the use of non-stable (Beta) resouces (runtimeconfig.v1beta1.Config).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-runtimeconfig-v1beta1-config-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (runtimeconfig.v1beta1.Config).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Config, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Runtimeconfig Config shouldn't use an unstable API (runtimeconfig.v1beta1.Config).");
        }),
    },
    vendors: ["google"],
    services: ["runtimeconfig"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
