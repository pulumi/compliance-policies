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
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that Kubernetes Services use the recommended labels.
 *
 * @severity Low
 * @link https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
 * https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
 */
export const configureRecommendedLabels: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-core-v1-service-configure-recommended-labels",
        description: "Checks that Kubernetes Services use the recommended labels.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(k8s.core.v1.Service, (service, args, reportViolation) => {
            if (!service.metadata || !service.metadata.labels) {
                reportViolation("Kubernetes Services should use the recommended labels.");
            } else {
                for (const key of Object.keys(service.metadata?.labels)) {
                    const recommendedLabels = [
                        "app.kubernetes.io/name",
                        "app.kubernetes.io/instance",
                        "app.kubernetes.io/version",
                        "app.kubernetes.io/component",
                        "app.kubernetes.io/part-of",
                        "app.kubernetes.io/managed-by",
                    ];

                    if (recommendedLabels.indexOf(key) === -1) {
                        reportViolation("Kubernetes Services should have the recommended labels.");
                    }
                }
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["core", "service"],
    severity: "low",
    topics: ["usability"],
});

/**
 * Checks that Kubernetes Services do not use a LoadBalancer as service type.
 *
 * This rule ensures that the kubernetes applications are not exposed using service type LoadBalancer as an additional load balancer is created each time when any new application is exposed through this service type. Instead it is recommended to the clusterIP or Ingress to expose the same set of services without undergoing a cost overhead.
 *
 * @severity Low
 * @link https://github.com/datreeio/datree/blob/main/examples/Cost_Reduction/README.md
 */
export const disallowLoadBalancer: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-core-v1-service-disallow-load-balancer",
        description: "Checks that Kubernetes Services do not use a LoadBalancer as service type.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(k8s.core.v1.Service, (service, args, reportViolation) => {
            if (service.spec) {
                if (service.spec.type && service.spec.type === "LoadBalancer") {
                    reportViolation("Kubernetes Services should not use a 'LoadBalancer' as a service type.");
                }
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["core", "service"],
    severity: "low",
    topics: ["cost", "network"],
});
