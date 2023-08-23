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

import { FirewallPolicy } from "@pulumi/google-native/compute/v1/firewallPolicy";
import * as google from "@pulumi/google-native";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

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
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(FirewallPolicy, (firewallPolicy, args, reportViolation) => {
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
