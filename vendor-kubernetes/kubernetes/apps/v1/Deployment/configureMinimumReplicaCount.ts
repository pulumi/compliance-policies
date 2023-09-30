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

import { Deployment } from "@pulumi/kubernetes/apps/v1";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that Kubernetes Deployments have at least three replicas.
 *
 * @severity high
 * @frameworks none
 * @topics availability
 * @link https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
 */
export const configureMinimumReplicaCount: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-apps-v1-deployment-configure-minimum-replica-count",
        description: "Checks that Kubernetes Deployments have at least three replicas.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Deployment, (deployment, args, reportViolation) => {
            if (!deployment.spec || !deployment.spec.replicas || deployment.spec.replicas < 3) {
                reportViolation("Kubernetes Deployments should have at least three replicas.");
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["apps"],
    severity: "high",
    topics: ["availability"],
});
