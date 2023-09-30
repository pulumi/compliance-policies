// Copyright 2016-2024, Pulumi Corporation.
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
