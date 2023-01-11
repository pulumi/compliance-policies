// Copyright 2016-2023, Pulumi Corporation.
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

import * as k8s from "@pulumi/kubernetes";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that Kubernetes ReplicaSets have at least three replicas.
 *
 * @severity High
 * @link https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/
 */
export const configureMinimumReplicaCount: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-apps-v1-replicaset-configure-minimum-replica-count",
        description: "Checks that Kubernetes ReplicaSets have at least three replicas.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(k8s.apps.v1.ReplicaSet, (replicaSet, args, reportViolation) => {
            if (!replicaSet.spec || !replicaSet.spec.replicas || replicaSet.spec.replicas < 3) {
                reportViolation("Kubernetes ReplicaSet should have at least three replicas.");
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["apps", "replicaset"],
    severity: "high",
    topics: ["availability"],
});

/**
 * Checks that Kubernetes ReplicaSets use the recommended labels.
 *
 * @severity Low
 * @link https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
 * https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
 */
export const configureRecommendedLabels: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-apps-v1-replicaset-configure-recommended-labels",
        description: "Checks that Kubernetes ReplicaSets use the recommended labels.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(k8s.apps.v1.ReplicaSet, (replicaSet, args, reportViolation) => {
            if (!replicaSet.metadata || !replicaSet.metadata.labels) {
                reportViolation("Kubernetes ReplicaSets should use the recommended labels.");
            } else {
                for (const key of Object.keys(replicaSet.metadata?.labels)) {
                    const recommendedLabels = [
                        "app.kubernetes.io/name",
                        "app.kubernetes.io/instance",
                        "app.kubernetes.io/version",
                        "app.kubernetes.io/component",
                        "app.kubernetes.io/part-of",
                        "app.kubernetes.io/managed-by",
                    ];

                    if (recommendedLabels.indexOf(key) === -1) {
                        reportViolation("Kubernetes ReplicaSets should have the recommended labels.");
                    }
                }
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["apps", "replicaset"],
    severity: "low",
    topics: ["usability"],
});