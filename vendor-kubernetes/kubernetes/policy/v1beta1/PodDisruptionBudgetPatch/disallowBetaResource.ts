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
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import { PodDisruptionBudgetPatch } from "@pulumi/kubernetes/policy/v1beta1";

/**
 * Disallow the use of non-stable (Beta) Kubernetes resouces (policy.v1beta1.PodDisruptionBudgetPatch).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://kubernetes.io/docs/concepts/overview/kubernetes-api/#api-groups-and-versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-policy-v1beta1-poddisruptionbudgetpatch-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) Kubernetes resouces (policy.v1beta1.PodDisruptionBudgetPatch).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(PodDisruptionBudgetPatch, (_, args, reportViolation) => {
            reportViolation("Kubernetes PodDisruptionBudgetPatch shouldn't use an unstable API (policy.v1beta1.PodDisruptionBudgetPatch).");
        }),
    },
    vendors: ["kubernetes"],
    services: ["policy"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
