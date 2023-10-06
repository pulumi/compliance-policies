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

import { FirewallPolicyRule } from "@pulumi/gcp/compute/firewallPolicyRule";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Check that Firewall Policy Rules do not allow inbound HTTP traffic.
 *
 * @severity critical
 * @frameworks cis, iso27001, pcidss
 * @topics encryption, network
 * @link https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
 */
export const disallowInboundHttpTraffic: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "gcp-compute-firewallpolicyrule-disallow-inbound-http-traffic",
        description: "Check that Firewall Policy Rules do not allow inbound HTTP traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(FirewallPolicyRule, (firewallPolicyRule, args, reportViolation) => {
            if (firewallPolicyRule.action === "allow" && firewallPolicyRule.direction === "INGRESS") {
                firewallPolicyRule.match.layer4Configs.forEach((l4Config) => {
                    if (l4Config.ipProtocol === "tcp") {
                        if (!l4Config.ports) {
                            reportViolation("Firewall Policy Rules should not allow ingress HTTP traffic. (Any inbound ports)");
                        } else {
                            l4Config.ports.forEach((port) => {
                                if (port === "80") {
                                    reportViolation("Firewall Policy Rules should not allow ingress HTTP traffic.");
                                }
                            });
                        }
                    }
                });
            }
        }),
    },
    vendors: ["google"],
    services: ["compute"],
    severity: "critical",
    topics: ["network", "encryption"],
    frameworks: ["iso27001", "pcidss", "cis"],
});
