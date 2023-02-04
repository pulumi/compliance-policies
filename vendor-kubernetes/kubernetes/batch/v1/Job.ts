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

import * as k8s from "@pulumi/kubernetes";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that Kubernetes Jobs have the recommended labels.
 *
 * @severity Low
 * @link https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
 * https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
 */
export const configureRecommendedLabels: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-batch-v1-job-configure-recommended-labels",
        description: "Checks that Kubernetes Jobs have the recommended labels.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(k8s.batch.v1.Job, (job, args, reportViolation) => {
            if (!job.metadata || !job.metadata.labels) {
                reportViolation("Kubernetes Jobs should use the recommended labels.");
            } else {
                for (const key of Object.keys(job.metadata?.labels)) {
                    const recommendedLabels = [
                        "app.kubernetes.io/name",
                        "app.kubernetes.io/instance",
                        "app.kubernetes.io/version",
                        "app.kubernetes.io/component",
                        "app.kubernetes.io/part-of",
                        "app.kubernetes.io/managed-by",
                    ];

                    if (recommendedLabels.indexOf(key) === -1) {
                        reportViolation("Kubernetes Jobs should have the recommended labels.");
                    }
                }
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["batch", "job"],
    severity: "low",
    topics: ["usability"],
});

/**
 * Checks that Kubernetes Jobs run pods with a read-only filesystem.
 *
 * An immutable root filesystem prevents applications from writing to their local disk. This is
 * desirable in the event of an intrusion as the attacker will not be able to tamper with the
 * filesystem or write foreign executables to disk.
 *
 * @severity High
 * @link https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
 */
export const enableReadOnlyRootFilesystem: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-batch-v1-job-enable-read-only-root-filesystem",
        description: "Checks that Kubernetes Jobs run pods with a read-only filesystem.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(k8s.batch.v1.Job, (job, args, reportViolation) => {
            if (job.spec && job.spec.template && job.spec.template.spec && job.spec.template.spec.containers.length > 0) {
                job.spec.template.spec.containers.forEach(container => {
                    if (!container.securityContext || !container.securityContext.readOnlyRootFilesystem) {
                        reportViolation("Kubernetes Jobs should run their pods using a read-only filesystem.");
                    }
                });
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["batch", "job"],
    severity: "high",
    topics: ["runtime", "security"],
});
