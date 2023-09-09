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

import { Cluster } from "@pulumi/aws/eks";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Check that EKS Clusters API Endpoint are not publicly accessible.
 *
 * @severity critical
 * @frameworks iso27001, pcidss
 * @topics network
 * @link https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html
 */
export const disallowApiEndpointPublicAccess: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-eks-cluster-disallow-api-endpoint-public-access",
        description: "Check that EKS Clusters API Endpoint are not publicly accessible.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Cluster, (cluster, args, reportViolation) => {
            if (cluster.vpcConfig.endpointPublicAccess === undefined || cluster.vpcConfig.endpointPublicAccess === true) {
                /**
                 * We need to check `publicAccessCidrs` for any `0.0.0.0/0`.
                 */
                if (!cluster.vpcConfig.publicAccessCidrs) {
                    reportViolation("EKS Cluster Endpoint API should not be publicly accessible.");
                } else {
                    if (cluster.vpcConfig.publicAccessCidrs.includes("0.0.0.0/0") || cluster.vpcConfig.publicAccessCidrs.includes("::/0")) {
                        reportViolation("EKS Cluster Endpoint API should not be publicly accessible.");
                    }
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["eks"],
    severity: "critical",
    topics: ["network"],
    frameworks: ["pcidss", "iso27001"],
});
