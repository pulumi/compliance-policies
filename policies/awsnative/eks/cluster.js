"use strict";
// Copyright 2016-2022, Pulumi Corporation.
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
exports.__esModule = true;
exports.disallowAPIEndpointPublicAccess = exports.enableClusterEncryptionConfig = void 0;
var awsnative = require("@pulumi/aws-native");
var policy_1 = require("@pulumi/policy");
var utils_1 = require("../../utils");
/**
 * Check that EKS Cluster Encryption Config is enabled.
 *
 * @severity **High**
 * @link https://aws.amazon.com/blogs/containers/using-eks-encryption-provider-support-for-defense-in-depth/
 * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws_native-properties-eks-cluster-encryptionconfig.html
 */
exports.enableClusterEncryptionConfig = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-eks-cluster-enable-cluster-encryption-config",
        description: "Check that EKS Cluster Encryption Config is enabled.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.eks.Cluster, function (cluster, args, reportViolation) {
            if (!cluster.encryptionConfig) {
                reportViolation("EKS Cluster Encryption Configuration should be enabled.");
            }
        })
    },
    vendors: ["aws"],
    services: ["eks"],
    severity: "high",
    topics: ["encryption", "kubernetes"]
});
/**
 * Check that EKS Clusters API Endpoint are not publicly accessible.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html
 */
exports.disallowAPIEndpointPublicAccess = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-eks-cluster-disallow-api-endpoint-public-access",
        description: "Check that EKS Clusters API Endpoint are not publicly accessible.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.eks.Cluster, function (cluster, args, reportViolation) {
            if (cluster.resourcesVpcConfig.endpointPublicAccess === undefined || cluster.resourcesVpcConfig.endpointPublicAccess === true) {
                /**
                 * We need to cleck `publicAccessCidrs` for any `0.0.0.0/0` and `::/0`.
                 */
                if (!cluster.resourcesVpcConfig.publicAccessCidrs) {
                    reportViolation("EKS Cluster Encryption API endpoint should not be publicly accessible.");
                }
                else {
                    if (cluster.resourcesVpcConfig.publicAccessCidrs.includes("0.0.0.0/0") || cluster.resourcesVpcConfig.publicAccessCidrs.includes("::/0")) {
                        reportViolation("EKS Cluster Encryption API endpoint should not be publicly accessible.");
                    }
                }
            }
        })
    },
    vendors: ["aws"],
    services: ["eks"],
    severity: "critical",
    topics: ["network"]
});
