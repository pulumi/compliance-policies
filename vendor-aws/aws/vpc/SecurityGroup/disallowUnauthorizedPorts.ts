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

import { SecurityGroup } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Configuration for vpc-sg-open-only-to-authorized-ports policy.
 */
interface VpcSgOpenOnlyToAuthorizedPortsConfig {
	authorizedTcpPorts?: string;
	authorizedUdpPorts?: string;
}

/**
 * Helper function to check if a port is within a range or matches a specific port.
 */
function isPortAuthorized(port: number, authorizedPortsStr: string): boolean {
	if (!authorizedPortsStr) {
		return false;
	}

	const authorizedPorts = authorizedPortsStr.split(",").map(p => p.trim());

	for (const authorizedPort of authorizedPorts) {
	// Check if it's a port range (e.g., "1020-1025")
		if (authorizedPort.includes("-")) {
			const [rangeStart, rangeEnd] = authorizedPort.split("-").map(Number);
			if (port >= rangeStart && port <= rangeEnd) {
				return true;
			}
		}
		// Check if it's a specific port
		else if (parseInt(authorizedPort, 10) === port) {
			return true;
		}
	}

	return false;
}

/**
 * Check if CIDR block represents global access (0.0.0.0/0 or ::/0).
 */
function isGloballyAccessible(cidrBlock: string): boolean {
  return cidrBlock === "0.0.0.0/0" || cidrBlock === "::/0";
}

/**
 * Checks security groups for unrestricted access (0.0.0.0/0 or ::/0) on non-authorized ports.
 *
 * @severity high
 * @frameworks cis, nist800-53, pcidss
 * @topics network, security
 * @link https://docs.aws.amazon.com/config/latest/developerguide/vpc-sg-open-only-to-authorized-ports.html
 */
export const disallowUnauthorizedPorts: ResourceValidationPolicy = policyManager.registerPolicy({
	resourceValidationPolicy: {
		name: "aws-vpc-securitygroup-disallow-unauthorized-ports",
		description: "Checks security groups for unrestricted access (0.0.0.0/0 or ::/0) on non-authorized ports.",
		configSchema: {
			properties: {
				authorizedTcpPorts: {
					type: "string",
					description: "Comma-separated list of authorized TCP ports or port ranges (e.g., '443,1020-1025')",
					default: "443,80",
				},
				authorizedUdpPorts: {
					type: "string",
					description: "Comma-separated list of authorized UDP ports or port ranges (e.g., '500,1020-1025')",
					default: "",
				},
				includeFor: {
					type: "array",
					items: { type: "string" },
					description: "List of resource name patterns to include in evaluation",
					default: [],
				},
				excludeFor: {
					type: "array",
					items: { type: "string" },
					description: "List of resource name patterns to exclude from evaluation",
					default: [],
				},
				ignoreCase: {
					type: "boolean",
					description: "Whether to ignore case when matching resource names",
					default: false,
				},
			},
		},
		enforcementLevel: "advisory",
		validateResource: validateResourceOfType(SecurityGroup, (sg, args, reportViolation) => {
			if (!policyManager.shouldEvalPolicy(args)) {
				return;
			}

			// Skip checking if no ingress rules
			if (!sg.ingress || sg.ingress.length === 0) {
				return;
			}

			// Get configuration or use defaults
			const config = args.getConfig<VpcSgOpenOnlyToAuthorizedPortsConfig>() || {};
			const authorizedTcpPorts = config.authorizedTcpPorts || "443,80";
			const authorizedUdpPorts = config.authorizedUdpPorts || "";

			// Check each ingress rule for unrestricted access
			for (const rule of sg.ingress) {
				// Skip if no CIDR blocks
				if (!rule.cidrBlocks || rule.cidrBlocks.length === 0) {
					continue;
				}

				// Check each CIDR block for global access
				for (const cidrBlock of rule.cidrBlocks) {
					if (isGloballyAccessible(cidrBlock)) {
						// For TCP protocol
						if (rule.protocol === "tcp") {
							// Check if from and to ports are authorized
							const fromPort = rule.fromPort || 0;
							const toPort = rule.toPort || 65535;

							// If it's a range of ports
							if (fromPort !== toPort) {
								for (let port = fromPort; port <= toPort; port++) {
									if (!isPortAuthorized(port, authorizedTcpPorts)) {
										reportViolation(
											`Security group '${sg.name}' allows unrestricted TCP access from ${cidrBlock} on unauthorized port ${port}. ` +
"Only authorized ports should be exposed to the internet. " +
"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-sg-open-only-to-authorized-ports.html"
										);
										// Break after first violation found for this rule to avoid excessive messages
										break;
									}
								}
							}
							// If it's a single port
							else if (!isPortAuthorized(fromPort, authorizedTcpPorts)) {
								reportViolation(
									`Security group '${sg.name}' allows unrestricted TCP access from ${cidrBlock} on unauthorized port ${fromPort}. ` +
"Only authorized ports should be exposed to the internet. " +
"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-sg-open-only-to-authorized-ports.html"
								);
							}
						}
						// For UDP protocol
						else if (rule.protocol === "udp") {
							// Check if from and to ports are authorized
							const fromPort = rule.fromPort || 0;
							const toPort = rule.toPort || 65535;

							// If it's a range of ports
							if (fromPort !== toPort) {
								for (let port = fromPort; port <= toPort; port++) {
									if (!isPortAuthorized(port, authorizedUdpPorts)) {
										reportViolation(
											`Security group '${sg.name}' allows unrestricted UDP access from ${cidrBlock} on unauthorized port ${port}. ` +
"Only authorized ports should be exposed to the internet. " +
"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-sg-open-only-to-authorized-ports.html"
										);
										// Break after first violation found for this rule to avoid excessive messages
										break;
									}
								}
							}
							// If it's a single port
							else if (!isPortAuthorized(fromPort, authorizedUdpPorts)) {
								reportViolation(
									`Security group '${sg.name}' allows unrestricted UDP access from ${cidrBlock} on unauthorized port ${fromPort}. ` +
"Only authorized ports should be exposed to the internet. " +
"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-sg-open-only-to-authorized-ports.html"
								);
							}
						}
						// For all other protocols
						else if (rule.protocol === "-1" || rule.protocol === "all") {
							reportViolation(
								`Security group '${sg.name}' allows unrestricted access from ${cidrBlock} for all protocols. ` +
"This poses a significant security risk. Only specific ports and protocols should be exposed to the internet. " +
"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-sg-open-only-to-authorized-ports.html"
							);
						}
					}
				}
			}
		}),
	},
	vendors: ["aws"],
	services: ["vpc"],
	severity: "high",
	topics: ["network", "security"],
	frameworks: ["cis", "nist800-53", "pcidss"],
});
