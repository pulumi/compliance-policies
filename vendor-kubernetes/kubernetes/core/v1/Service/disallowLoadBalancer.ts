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

import { Service } from "@pulumi/kubernetes/core/v1";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

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
