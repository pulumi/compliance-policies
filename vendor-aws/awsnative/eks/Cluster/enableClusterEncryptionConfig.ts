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

import { Cluster } from "@pulumi/aws-native/eks";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Check that EKS Cluster Encryption Config is enabled.
 *
 * @severity high
 * @frameworks hitrust, iso27001, pcidss
 * @topics encryption, kubernetes
 * @link https://aws.amazon.com/blogs/containers/using-eks-encryption-provider-support-for-defense-in-depth/
 */
export const enableClusterEncryptionConfig: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-eks-cluster-enable-cluster-encryption-config",
        description: "Check that EKS Cluster Encryption Config is enabled.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Cluster, (cluster, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (!cluster.encryptionConfig || cluster.encryptionConfig.length < 1) {
                reportViolation("EKS Cluster Encryption Configuration should be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["eks"],
    severity: "high",
    topics: ["encryption", "kubernetes"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
