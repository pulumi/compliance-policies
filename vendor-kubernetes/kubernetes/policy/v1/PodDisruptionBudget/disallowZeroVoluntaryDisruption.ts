// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { PodDisruptionBudget } from "@pulumi/kubernetes/policy/v1";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that Kubernetes PodDisruptionBudgets have a voluntary disruption.
 *
 * This policy ensures that the our highly available worloads used in
 * production are not denied any voluntary disruption. If you set
 * `maxUnavailable` to 0% or 0, or you set `minAvailable` to 100% or the number of
 * replicas, you are requiring zero voluntary evictions. When you set zero
 * voluntary evictions for a workload object such as `ReplicaSet`, then you
 * cannot successfully drain a Node running one of those Pods. If you try to
 * drain a Node where an unevictable Pod is running, the drain never completes.
 *
 * @severity High
 * @link https://kubernetes.io/docs/tasks/run-application/configure-pdb/
 * https://github.com/datreeio/datree/blob/main/examples/Governance/README.md
 */
export const disallowZeroVoluntaryDisruption: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-policy-v1-poddisruptionbudget-disallow-zero-voluntary-disruption",
        description: "Checks that Kubernetes PodDisruptionBudgets have a voluntary disruption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(PodDisruptionBudget, (podDisruptionBudget, args, reportViolation) => {
            if (podDisruptionBudget.spec) {
                if (podDisruptionBudget.spec.maxUnavailable !== undefined) {

                    switch(typeof podDisruptionBudget.spec.maxUnavailable) {
                    case "string": // value is expressed in %
                        const v = parseFloat(podDisruptionBudget.spec.maxUnavailable);
                        if (v === 0) {
                            reportViolation("Kubernetes PodDisruptionBudgets should allow voluntary pod disruption when setting 'maxUnavailable'.");
                        }
                        break;

                    case "number":
                        if (podDisruptionBudget.spec.maxUnavailable === 0 ) {
                            reportViolation("Kubernetes PodDisruptionBudgets should allow voluntary pod disruption when setting 'maxUnavailable'.");
                        }
                        break;

                    default:
                        break;
                    }
                }

                if (podDisruptionBudget.spec.minAvailable !== undefined) {
                    switch(typeof podDisruptionBudget.spec.minAvailable) {
                    case "string": // value is expressed in %
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
