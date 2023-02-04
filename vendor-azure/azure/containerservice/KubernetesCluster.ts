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

import * as azure from "@pulumi/azure";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import {policiesManagement} from "@pulumi-premium-policies/policy-management";

/**
 * Checks AKS cluster has Network Policy configured.
 *
 * @severity High
 * @link https://docs.microsoft.com/azure/virtual-machines/linux/disk-encryption-overview
 */
export const configureNetworkPolicy: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "azure-containerservice-kubernetescluster-configure-network-policy",
        description: "Checks AKS cluster has Network Policy configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(azure.containerservice.KubernetesCluster, (kubernetesCluster, args, reportViolation) => {
            if (kubernetesCluster.networkProfile) {
                if (!kubernetesCluster.networkProfile.networkPolicy) {
                    reportViolation("Ensure AKS cluster has Network Policy configured.");
                }
            }
        }),
    },
    vendors: ["azure"],
    services: ["containerservice"],
    severity: "high",
    topics: ["network", "kubernetes"],
});
