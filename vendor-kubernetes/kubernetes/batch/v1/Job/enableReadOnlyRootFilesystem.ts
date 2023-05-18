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

import { Job } from "@pulumi/kubernetes/batch/v1";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that Kubernetes Jobs run pods with a read-only filesystem.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics runtime, security
 * @link https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
 */
export const enableReadOnlyRootFilesystem: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-batch-v1-job-enable-read-only-root-filesystem",
        description: "Checks that Kubernetes Jobs run pods with a read-only filesystem.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Job, (job, args, reportViolation) => {
            if (job.spec && job.spec.template && job.spec.template.spec && job.spec.template.spec.containers.length > 0) {
                job.spec.template.spec.containers.forEach((container) => {
                    if (!container.securityContext || !container.securityContext.readOnlyRootFilesystem) {
                        reportViolation("Kubernetes Jobs should run their pods using a read-only filesystem.");
                    }
                });
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["batch"],
    severity: "high",
    topics: ["runtime", "security"],
    frameworks: ["pcidss", "iso27001"],
});
