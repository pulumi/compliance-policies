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

import { StatefulSet } from "@pulumi/kubernetes/apps/v1";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that Kubernetes StatefulSets have the recommended labels.
 *
 * @severity low
 * @frameworks none
 * @topics usability
 * @link https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
 */
export const configureRecommendedLabels: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-apps-v1-statefulset-configure-recommended-labels",
        description: "Checks that Kubernetes StatefulSets have the recommended labels.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(StatefulSet, (statefulSet, args, reportViolation) => {
            if (!statefulSet.metadata || !statefulSet.metadata.labels) {
                reportViolation("Kubernetes StatefulSets should use the recommended labels.");
            } else {
                for (const key of Object.keys(statefulSet.metadata?.labels)) {
                    const recommendedLabels = [
                        "app.kubernetes.io/name",
                        "app.kubernetes.io/instance",
                        "app.kubernetes.io/version",
                        "app.kubernetes.io/component",
                        "app.kubernetes.io/part-of",
                        "app.kubernetes.io/managed-by",
                    ];
                    if (recommendedLabels.indexOf(key) === -1) {
                        reportViolation("Kubernetes StatefulSets should have the recommended labels.");
                    }
                }
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["apps"],
    severity: "low",
    topics: ["usability"],
});
