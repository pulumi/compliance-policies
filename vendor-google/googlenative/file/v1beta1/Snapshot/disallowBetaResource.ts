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
import { Snapshot } from "@pulumi/google-native/file/v1beta1";

/**
 * Disallow the use of non-stable (Beta) resouces (file.v1beta1.Snapshot).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-file-v1beta1-snapshot-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (file.v1beta1.Snapshot).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Snapshot, (_, args, reportViolation) => {
            reportViolation("File Snapshot shouldn't use an unstable API (file.v1beta1.Snapshot).");
        }),
    },
    vendors: ["google"],
    services: ["file"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
