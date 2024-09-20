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
import { LeaseCandidateList } from "@pulumi/kubernetes/coordination/v1alpha1";

/**
 * Disallow the use of non-stable (Alpha) Kubernetes resouces (coordination.v1alpha1.LeaseCandidateList).
 *
 * @severity medium
 * @frameworks none
 * @topics alpha, api, unstable
 * @link https://kubernetes.io/docs/concepts/overview/kubernetes-api/#api-groups-and-versioning
 */
export const disallowAlphaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-coordination-v1alpha1-leasecandidatelist-disallow-alpha-resource",
        description: "Disallow the use of non-stable (Alpha) Kubernetes resouces (coordination.v1alpha1.LeaseCandidateList).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(LeaseCandidateList, (_, args, reportViolation) => {
            reportViolation("Kubernetes LeaseCandidateList shouldn't use an unstable API (coordination.v1alpha1.LeaseCandidateList).");
        }),
    },
    vendors: ["kubernetes"],
    services: ["coordination"],
    severity: "medium",
    topics: ["api", "unstable", "alpha"],
});