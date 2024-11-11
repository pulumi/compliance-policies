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
import { RegionJobIamMember } from "@pulumi/google-native/dataproc/v1beta2";

/**
 * Disallow the use of non-stable (Beta) resouces (dataproc.v1beta2.RegionJobIamMember).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-dataproc-v1beta2-regionjobiammember-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (dataproc.v1beta2.RegionJobIamMember).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(RegionJobIamMember, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Dataproc RegionJobIamMember shouldn't use an unstable API (dataproc.v1beta2.RegionJobIamMember).");
        }),
    },
    vendors: ["google"],
    services: ["dataproc"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
