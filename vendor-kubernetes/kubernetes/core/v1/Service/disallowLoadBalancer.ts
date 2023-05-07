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

import { Service } from "@pulumi/kubernetes/core/v1";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that Kubernetes Services do not use a LoadBalancer as service type.
 *
 * @severity low
 * @frameworks none
 * @topics cost, network
 * @link https://github.com/datreeio/datree/blob/main/examples/Cost_Reduction/README.md
 */
export const disallowLoadBalancer: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-core-v1-service-disallow-load-balancer",
        description: "Checks that Kubernetes Services do not use a LoadBalancer as service type.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Service, (service, args, reportViolation) => {
            if (service.spec) {
                if (service.spec.type && service.spec.type === "LoadBalancer") {
                    reportViolation("Kubernetes Services should not use a 'LoadBalancer' as a service type.");
                }
            }
        }),
    },
    vendors: ["kubernetes"],
    services: ["core"],
    severity: "low",
    topics: ["cost", "network"],
});
