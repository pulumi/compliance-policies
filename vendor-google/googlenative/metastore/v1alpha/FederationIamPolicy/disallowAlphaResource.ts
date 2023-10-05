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
import { policyManager } from "@pulumi/policy-manager";
import { FederationIamPolicy } from "@pulumi/google-native/metastore/v1alpha";

/**
 * Disallow the use of non-stable (Alpha) resouces (metastore.v1alpha.FederationIamPolicy).
 *
 * @severity medium
 * @frameworks none
 * @topics alpha, api, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowAlphaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-metastore-v1alpha-federationiampolicy-disallow-alpha-resource",
        description: "Disallow the use of non-stable (Alpha) resouces (metastore.v1alpha.FederationIamPolicy).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(FederationIamPolicy, (_, args, reportViolation) => {
            reportViolation("Metastore FederationIamPolicy shouldn't use an unstable API (metastore.v1alpha.FederationIamPolicy).");
        }),
    },
    vendors: ["google"],
    services: ["metastore"],
    severity: "medium",
    topics: ["api", "unstable", "alpha"],
});
