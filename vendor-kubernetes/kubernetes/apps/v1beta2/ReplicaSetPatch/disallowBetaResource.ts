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
import { ReplicaSetPatch } from "@pulumi/kubernetes/apps/v1beta2";

/**
 * Disallow the use of non-stable (Beta) Kubernetes resouces (apps.v1beta2.ReplicaSetPatch).
 *
 * @severity medium
 * @frameworks none
 * @topics api, beta, unstable
 * @link https://kubernetes.io/docs/concepts/overview/kubernetes-api/#api-groups-and-versioning
 */
export const disallowBetaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-apps-v1beta2-replicasetpatch-disallow-beta-resource",
        description: "Disallow the use of non-stable (Beta) Kubernetes resouces (apps.v1beta2.ReplicaSetPatch).",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(ReplicaSetPatch, (_, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            reportViolation("Kubernetes ReplicaSetPatch shouldn't use an unstable API (apps.v1beta2.ReplicaSetPatch).");
        }),
    },
    vendors: ["kubernetes"],
    services: ["apps"],
    severity: "medium",
    topics: ["api", "unstable", "beta"],
});
