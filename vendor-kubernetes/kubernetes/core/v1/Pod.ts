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
 * Checks that Kubernetes Pods are not used directly.
 *
 * @severity Critical
 * @link https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
 */
export const disallowPod: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-core-v1-pod-disallow-pod",
        description: "Checks that Kubernetes Pods are not used directly.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(k8s.core.v1.Pod, (pod, args, reportViolation) => {
            reportViolation("Kubernetes Pods should not be used directly. Instead, you may want to use a Deployment, ReplicaSet, DaemonSet or Job.");
        }),
    },
    vendors: ["kubernetes"],
    services: ["core", "pod"],
    severity: "critical",
    topics: ["availability"],
});