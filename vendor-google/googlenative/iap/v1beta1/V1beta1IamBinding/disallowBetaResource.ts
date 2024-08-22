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
import { V1beta1IamBinding } from "@pulumi/google-native/iap/v1beta1";

/**
 * Disallow the use of non-stable (Beta) resouces (iap.v1beta1.V1beta1IamBinding).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-iap-v1beta1-v1beta1iambinding-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (iap.v1beta1.V1beta1IamBinding).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(V1beta1IamBinding, (_, args, reportViolation) => {
            reportViolation("Iap V1beta1IamBinding shouldn't use an unstable API (iap.v1beta1.V1beta1IamBinding).");
        }),
    },
    vendors: ["google"],
    services: ["iap"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
