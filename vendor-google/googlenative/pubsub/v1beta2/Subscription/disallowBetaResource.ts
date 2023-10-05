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
import { Subscription } from "@pulumi/google-native/pubsub/v1beta2";

/**
 * Disallow the use of non-stable (Beta) resouces (pubsub.v1beta2.Subscription).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-pubsub-v1beta2-subscription-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) resouces (pubsub.v1beta2.Subscription).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Subscription, (_, args, reportViolation) => {
            reportViolation("Pubsub Subscription shouldn't use an unstable API (pubsub.v1beta2.Subscription).");
        }),
    },
    vendors: ["google"],
    services: ["pubsub"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
