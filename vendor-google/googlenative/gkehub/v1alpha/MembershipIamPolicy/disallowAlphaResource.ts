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
import { MembershipIamPolicy } from "@pulumi/google-native/gkehub/v1alpha";

/**
 * Disallow the use of non-stable (Alpha) resouces (gkehub.v1alpha.MembershipIamPolicy).
 *
 * @severity medium
 * @frameworks none
 * @topics alpha, api, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowAlphaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-gkehub-v1alpha-membershipiampolicy-disallow-alpha-resource",
        description: "Disallow the use of non-stable (Alpha) resouces (gkehub.v1alpha.MembershipIamPolicy).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(MembershipIamPolicy, (_, args, reportViolation) => {
            reportViolation("Gkehub MembershipIamPolicy shouldn't use an unstable API (gkehub.v1alpha.MembershipIamPolicy).");
        }),
    },
    vendors: ["google"],
    services: ["gkehub"],
    severity: "medium",
    topics: ["api", "unstable", "alpha"],
});
