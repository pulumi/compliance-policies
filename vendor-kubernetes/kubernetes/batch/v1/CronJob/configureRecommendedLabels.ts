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

import { CronJob } from "@pulumi/kubernetes/batch/v1";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that Kubernetes CronJobs have the recommended labels.
 *
 * @severity Low
 * @link https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
 * https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
 */
export const configureRecommendedLabels: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-batch-v1-cronjob-configure-recommended-labels",
        description: "Checks that Kubernetes CronJobs have the recommended labels.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(CronJob, (cronJob, args, reportViolation) => {
            if (!cronJob.metadata || !cronJob.metadata.labels) {
                reportViolation("Kubernetes CronJobs should use the recommended labels.");
            } else {
                for (const key of Object.keys(cronJob.metadata?.labels)) {
                    const recommendedLabels = [
                        "app.kubernetes.io/name",
                        "app.kubernetes.io/instance",
                        "app.kubernetes.io/version",
                        "app.kubernetes.io/component",
                        "app.kubernetes.io/part-of",
                        "app.kubernetes.io/managed-by",
                    ];

                    if (recommendedLabels.indexOf(key) === -1) {
                        reportViolation("Kubernetes CronJobs should have the recommended labels.");
                    }
                }
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["batch"],
    severity: "low",
    topics: ["usability"],
});
