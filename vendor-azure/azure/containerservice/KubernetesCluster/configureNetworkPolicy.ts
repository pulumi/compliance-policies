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

import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import { KubernetesCluster } from "@pulumi/azure/containerservice";

/**
 * Checks AKS cluster has Network Policy configured.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics kubernetes, network
 * @link https://kubernetes.io/docs/concepts/services-networking/network-policies/
 */
export const configureNetworkPolicy: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azure-containerservice-kubernetescluster-configure-network-policy",
        description: "Checks AKS cluster has Network Policy configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(KubernetesCluster, (kubernetesCluster, args, reportViolation) => {
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
    frameworks: ["pcidss", "iso27001"],
});
