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

import * as awsnative from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";

import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Check that EKS Cluster Encryption Config is enabled.
 *
 * @severity High
 * @link https://aws.amazon.com/blogs/containers/using-eks-encryption-provider-support-for-defense-in-depth/
 * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws_native-properties-eks-cluster-encryptionconfig.html
 */
export const enableClusterEncryptionConfig: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-eks-cluster-enable-cluster-encryption-config",
        description: "Check that EKS Cluster Encryption Config is enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.eks.Cluster, (cluster, args, reportViolation) => {
            if (!cluster.encryptionConfig || cluster.encryptionConfig.length < 1) {
                reportViolation("EKS Cluster Encryption Configuration should be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["eks"],
    severity: "high",
    topics: ["encryption", "kubernetes"],
});

/**
 * Check that EKS Clusters API Endpoint are not publicly accessible.
 *
 * @severity Critical
 * @link https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html
 */
export const disallowApiEndpointPublicAccess: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-eks-cluster-disallow-api-endpoint-public-access",
        description: "Check that EKS Clusters API Endpoint are not publicly accessible.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.eks.Cluster, (cluster, args, reportViolation) => {
            if (cluster.resourcesVpcConfig.endpointPublicAccess === undefined || cluster.resourcesVpcConfig.endpointPublicAccess === true) {
                /**
                 * We need to check `publicAccessCidrs` for any `0.0.0.0/0` and `::/0`.
                 */
                if (!cluster.resourcesVpcConfig.publicAccessCidrs) {
                    reportViolation("EKS Cluster Encryption API endpoint should not be publicly accessible.");
                } else {
                    if (cluster.resourcesVpcConfig.publicAccessCidrs.includes("0.0.0.0/0") || cluster.resourcesVpcConfig.publicAccessCidrs.includes("::/0")) {
                        reportViolation("EKS Cluster Encryption API endpoint should not be publicly accessible.");
                    }
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["eks"],
    severity: "critical",
    topics: ["network"],
});
