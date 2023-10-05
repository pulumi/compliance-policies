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
import { Route } from "@pulumi/google-native/datastream/v1alpha1";

/**
 * Disallow the use of non-stable (Alpha) resouces (datastream.v1alpha1.Route).
 *
 * @severity medium
 * @frameworks none
 * @topics alpha, api, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowAlphaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-datastream-v1alpha1-route-disallow-alpha-resource",
        description: "Disallow the use of non-stable (Alpha) resouces (datastream.v1alpha1.Route).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Route, (_, args, reportViolation) => {
            reportViolation("Datastream Route shouldn't use an unstable API (datastream.v1alpha1.Route).");
        }),
    },
    vendors: ["google"],
    services: ["datastream"],
    severity: "medium",
    topics: ["api", "unstable", "alpha"],
});
