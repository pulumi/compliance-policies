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

import { PodDisruptionBudget } from "@pulumi/kubernetes/policy/v1";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/policy-manager";

/**
 * Checks that Kubernetes PodDisruptionBudgets have a voluntary disruption.
 *
 * @severity high
 * @frameworks none
 * @topics availability
 * @link https://kubernetes.io/docs/tasks/run-application/configure-pdb/
 */
export const disallowZeroVoluntaryDisruption: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-policy-v1-poddisruptionbudget-disallow-zero-voluntary-disruption",
        description: "Checks that Kubernetes PodDisruptionBudgets have a voluntary disruption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(PodDisruptionBudget, (podDisruptionBudget, args, reportViolation) => {
            if (podDisruptionBudget.spec) {
                if (podDisruptionBudget.spec.maxUnavailable !== undefined) {
                    switch (typeof podDisruptionBudget.spec.maxUnavailable) {
                        case "string":
                            // value is expressed in %
                            const v = parseFloat(podDisruptionBudget.spec.maxUnavailable);
                            if (v === 0) {
                                reportViolation("Kubernetes PodDisruptionBudgets should allow voluntary pod disruption when setting 'maxUnavailable'.");
                            }
                            break;
                        case "number":
                            if (podDisruptionBudget.spec.maxUnavailable === 0) {
                                reportViolation("Kubernetes PodDisruptionBudgets should allow voluntary pod disruption when setting 'maxUnavailable'.");
                            }
                            break;
                        default:
                            break;
                    }
                }
                if (podDisruptionBudget.spec.minAvailable !== undefined) {
                    switch (typeof podDisruptionBudget.spec.minAvailable) {
                        case "string":
                            // value is expressed in %
                            const v = parseFloat(podDisruptionBudget.spec.minAvailable);
                            if (v === 100) {
                                reportViolation("Kubernetes PodDisruptionBudgets should allow voluntary pod disruption when setting 'minAvailable'.");
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["policy"],
    severity: "high",
    topics: ["availability"],
});
