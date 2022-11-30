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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";

import { policyRegistrations } from "../../utils";

/**
 * Check that EKS Cluster Encryption Config is enabled.
 *
 * @severity **High**
 * @link https://aws.amazon.com/blogs/containers/using-eks-encryption-provider-support-for-defense-in-depth/
 * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-eks-cluster-encryptionconfig.html
 */
export const enableClusterEncryptionConfig: ResourceValidationPolicy = {
    name: "aws-eks-cluster-enable-cluster-encryption-config",
    description: "Check that EKS Cluster Encryption Config is enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.eks.Cluster, (cluster, args, reportViolation) => {
        if (!cluster.encryptionConfig) {
            reportViolation("EKS Cluster Encryption Configuration should be enabled.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: enableClusterEncryptionConfig,
    vendors: ["aws"],
    services: ["eks"],
    severity: "high",
    topics: ["encryption", "kubernetes"],
});

/**
 * Check that EKS Clusters API Endpoint are not publicly accessible.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html
 */
export const disallowAPIEndpointPublicAccess: ResourceValidationPolicy = {
    name: "aws-eks-cluster-disallow-api-endpoint-public-access",
    description: "Check that EKS Clusters API Endpoint are not publicly accessible.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.eks.Cluster, (cluster, args, reportViolation) => {
        if (cluster.vpcConfig.endpointPublicAccess === undefined || cluster.vpcConfig.endpointPublicAccess === true) {
            /**
             * We need to cleck `publicAccessCidrs` for any `0.0.0.0/0`.
             */
            if (!cluster.vpcConfig.publicAccessCidrs) {
                reportViolation("EKS Cluster Encryption API endpoint should not be publicly accessible.");
            } else {
                if (cluster.vpcConfig.publicAccessCidrs.includes("0.0.0.0/0") || cluster.vpcConfig.publicAccessCidrs.includes("::/0")) {
                    reportViolation("EKS Cluster Encryption API endpoint should not be publicly accessible.");
                }
            }
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: disallowAPIEndpointPublicAccess,
    vendors: ["aws"],
    services: ["eks"],
    severity: "critical",
    topics: ["network"],
});
