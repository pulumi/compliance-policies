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

import { FirewallPolicy } from "@pulumi/google-native/compute/v1/firewallPolicy";
import * as google from "@pulumi/google-native";
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
        name: "googlenative-compute-v1-firewallpolicy-disallow-inbound-http-traffic",
        description: "Check that Firewall Policy Rules do not allow inbound HTTP traffic.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(FirewallPolicy, (firewallPolicy, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (firewallPolicy.rules && firewallPolicy.rules.length > 0) {
                firewallPolicy.rules.forEach((rule) => {
                    if (rule.match) {
                        if (rule.match.layer4Configs && rule.match.layer4Configs.length > 0) {
                            rule.match.layer4Configs.forEach((layer4Config) => {
                                if (layer4Config.ipProtocol && layer4Config.ipProtocol === "tcp") {
                                    if (!layer4Config.ports) {
                                        reportViolation("Firewall Policy Rules should not allow ingress HTTP traffic. (Any inbound ports)");
                                    } else {
                                        layer4Config.ports.forEach((port) => {
                                            if (port === "80") {
                                                reportViolation("Firewall Policy Rules should not allow ingress HTTP traffic.");
                                            }
                                        });
                                    }
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
