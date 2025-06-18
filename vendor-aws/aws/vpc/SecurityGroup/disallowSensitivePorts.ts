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
 * Configuration for vpc-sg-port-restriction-check policy.
 */
interface VpcSgPortRestrictionCheckConfig {
	restrictPorts?: string;
	protocolType?: string;
	ipType?: string;
	excludeExternalSecurityGroups?: boolean;
}

/**
 * Check if CIDR block represents global access (0.0.0.0/0 or ::/0).
 */
function isGloballyAccessible(cidrBlock: string): boolean {
  return cidrBlock === "0.0.0.0/0" || cidrBlock === "::/0";
}

/**
 * Filter global IP access based on IP type configuration.
 */
function shouldCheckIpType(cidrBlock: string, ipType: string): boolean {
	if (ipType === "ALL") {
		return true;
	} else if (ipType === "IPv4" && cidrBlock === "0.0.0.0/0") {
		return true;
	} else if (ipType === "IPv6" && cidrBlock === "::/0") {
		return true;
	}
	return false;
}

/**
 * Checks security groups for unrestricted access on sensitive ports like SSH (22) and RDP (3389).
 *
 * @severity high
 * @frameworks cis, nist800-53, pcidss
 * @topics network, security
 * @link https://docs.aws.amazon.com/config/latest/developerguide/vpc-sg-port-restriction-check.html
 */
export const disallowSensitivePorts: ResourceValidationPolicy = policyManager.registerPolicy({
	resourceValidationPolicy: {
		name: "aws-vpc-securitygroup-disallow-sensitive-ports",
		description: "Checks security groups for unrestricted access on sensitive ports like SSH (22) and RDP (3389).",
		configSchema: {
			properties: {
				restrictPorts: {
					type: "string",
					description: "Comma-separated list of restricted ports that should not be open to the internet",
					default: "22,3389",
				},
				protocolType: {
					type: "string",
					description: "Protocol type to check (TCP, UDP, or ALL)",
					default: "ALL",
					enum: ["TCP", "UDP", "ALL"],
				},
				ipType: {
					type: "string",
					description: "IP version to check (IPv4, IPv6, or ALL)",
					default: "ALL",
					enum: ["IPv4", "IPv6", "ALL"],
				},
				excludeExternalSecurityGroups: {
					type: "boolean",
					description: "Whether to exclude external security groups from evaluation",
					default: true,
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
			const config = args.getConfig<VpcSgPortRestrictionCheckConfig>() || {};
			const restrictPortsStr = config.restrictPorts || "22,3389";
			const protocolType = config.protocolType || "ALL";
			const ipType = config.ipType || "ALL";
			const excludeExternalSecurityGroups = config.excludeExternalSecurityGroups === undefined ? true : config.excludeExternalSecurityGroups;

			// Parse restricted ports
			const restrictPorts = restrictPortsStr.split(",").map(p => parseInt(p.trim(), 10));

			// Skip external security groups if configured
			if (excludeExternalSecurityGroups && sg.name && (sg.name.startsWith("eks-cluster-sg") || sg.name.startsWith("external-"))) {
				return;
			}

			// Check each ingress rule
			for (const rule of sg.ingress) {
				// Skip if no CIDR blocks
				if (!rule.cidrBlocks || rule.cidrBlocks.length === 0) {
					continue;
				}

				// Check protocol type
				if (protocolType !== "ALL") {
					if (protocolType === "TCP" && rule.protocol !== "tcp") {
						continue;
					}
					if (protocolType === "UDP" && rule.protocol !== "udp") {
						continue;
					}
				}

				// Check each CIDR block for global access
				for (const cidrBlock of rule.cidrBlocks) {
					if (isGloballyAccessible(cidrBlock) && shouldCheckIpType(cidrBlock, ipType)) {
						const fromPort = rule.fromPort || 0;
						const toPort = rule.toPort || 65535;

						// Check if any restricted port is within the range
						const hasRestrictedPort = restrictPorts.some(port =>
							(fromPort <= port && port <= toPort)
						);

						if (hasRestrictedPort) {
							// Build a message that includes which specific restricted ports were found
							const violatingPorts = restrictPorts
								.filter(port => (fromPort <= port && port <= toPort))
								.join(", ");

							reportViolation(
								`Security group '${sg.name}' allows unrestricted access from ${cidrBlock} to sensitive port(s): ${violatingPorts}. ` +
"Exposing these ports to the internet poses a significant security risk. " +
"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-sg-port-restriction-check.html"
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
