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
import { ServicePerimeter } from "@pulumi/google-native/accesscontextmanager/v1beta";

/**
 * Disallow the use of non-stable (Beta) resouces (accesscontextmanager.v1beta.ServicePerimeter).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-accesscontextmanager-v1beta-serviceperimeter-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (accesscontextmanager.v1beta.ServicePerimeter).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(ServicePerimeter, (_, args, reportViolation) => {
            reportViolation("Accesscontextmanager ServicePerimeter shouldn't use an unstable API (accesscontextmanager.v1beta.ServicePerimeter).");
        }),
    },
    vendors: ["google"],
    services: ["accesscontextmanager"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
