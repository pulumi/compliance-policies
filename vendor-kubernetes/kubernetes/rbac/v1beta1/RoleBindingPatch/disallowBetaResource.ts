// Copyright 2016-2025, Pulumi Corporation.
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
import { RoleBindingPatch } from "@pulumi/kubernetes/rbac/v1beta1";

/**
 * Disallow the use of non-stable (Beta) Kubernetes resouces (rbac.v1beta1.RoleBindingPatch).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://kubernetes.io/docs/concepts/overview/kubernetes-api/#api-groups-and-versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-rbac-v1beta1-rolebindingpatch-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) Kubernetes resouces (rbac.v1beta1.RoleBindingPatch).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(RoleBindingPatch, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Kubernetes RoleBindingPatch shouldn't use an unstable API (rbac.v1beta1.RoleBindingPatch).");
        }),
    },
    vendors: ["kubernetes"],
    services: ["rbac"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
