// Copyright 2016-2025, Pulumi Corporation.
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

import { LoadBalancer } from "@pulumi/aws/elb";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Check that ELB Load Balancers do not allow unencrypted (HTTP) traffic.
 *
 * @severity critical
 * @frameworks hitrust, iso27001, pcidss
 * @topics network
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-https-load-balancers.html
 */
export const disallowUnencryptedTraffic: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-loadbalancer-disallow-unencrypted-traffic",
        description: "Check that ELB Load Balancers do not allow unencrypted (HTTP) traffic.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            loadBalancer.listeners.forEach((listener) => {
                if (listener.lbProtocol.toLowerCase() === "http") {
                    reportViolation("ELB Load Balancers should now allow unencrypted (HTTP) traffic.");
                }
            });
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "critical",
    topics: ["network"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
