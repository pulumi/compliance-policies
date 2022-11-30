// Copyright 2016-2022, Pulumi Corporation.
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
import { policyRegistrations } from "../../../utils";

/**
 * Checks that Kubernetes Deployments have at least three replicas.
 *
 * @severity **High**
 * @link https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/
 */
export const configureMinimumReplicaCount: ResourceValidationPolicy = {
    name: "kubernetes-core-v1-deployment-configure-minimum-replica-count",
    description: "Checks that Kubernetes Deployments have at least three replicas.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(k8s.apps.v1.Deployment, (deployment, args, reportViolation) => {
        if (!deployment.spec || !deployment.spec.replicas || deployment.spec.replicas < 3) {
            reportViolation("Kubernetes Deployments should have at least three replicas.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: configureMinimumReplicaCount,
    vendors: ["kubernetes"],
    services: ["apps", "replicaset"],
    severity: "high",
    topics: ["availability"],
});

/**
 * Checks that Kubernetes Deployments have the recommended label.
 *
 * @severity **Low**
 * @link https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
 * https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
 */
export const configureRecommendedLabel: ResourceValidationPolicy = {
    name: "kubernetes-core-v1-deployment-configure-recommended-labels",
    description: "Checks that Kubernetes Deployments use the recommended labels.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(k8s.apps.v1.Deployment, (deployment, args, reportViolation) => {
        if (!deployment.metadata || !deployment.metadata.labels) {
            reportViolation("Kubernetes Deployments should use the recommended labels.");
        } else {
            for (const key of Object.keys(deployment.metadata?.labels)) {
                const recommendedLabels = [
                    "app.kubernetes.io/name",
                    "app.kubernetes.io/instance",
                    "app.kubernetes.io/version",
                    "app.kubernetes.io/component",
                    "app.kubernetes.io/part-of",
                    "app.kubernetes.io/managed-by",
                ];

                if (recommendedLabels.indexOf(key) === -1) {
                    reportViolation("Kubernetes Deployments should have the recommended labels.");
                }
            }
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: configureRecommendedLabel,
    vendors: ["kubernetes"],
    services: ["apps", "deployment"],
    severity: "low",
    topics: ["usability"],
});
