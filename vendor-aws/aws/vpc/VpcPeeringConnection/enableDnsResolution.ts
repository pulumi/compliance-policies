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

import { VpcPeeringConnection } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Configuration for vpc-peering-dns-resolution-check policy.
 */
interface VpcPeeringDnsResolutionCheckConfig {
    vpcIds?: string[];
}

/**
 * Checks if DNS resolution from accepter/requester VPC to private IP is enabled for VPC peering connections.
 *
 * @severity medium
 * @frameworks cis, nist800-53, pcidss
 * @topics network, security
 * @link https://docs.aws.amazon.com/config/latest/developerguide/vpc-peering-dns-resolution-check.html
 */
export const enableDnsResolution: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-vpc-vpcpeeringconnection-enable-dns-resolution",
        description: "Checks if DNS resolution from accepter/requester VPC to private IP is enabled for VPC peering connections.",
        configSchema: {
            properties: {
                vpcIds: {
                    type: "array",
                    items: { type: "string" },
                    description: "Optional list of specific VPC IDs to check. If not provided, all VPC peering connections are checked.",
                    default: [],
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
        validateResource: validateResourceOfType(VpcPeeringConnection, (peeringConnection, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            // Get configuration or use defaults
            const config = args.getConfig<VpcPeeringDnsResolutionCheckConfig>() || {};
            const specificVpcIds = config.vpcIds || [];

            // Extract the accepter and requester VPC IDs
            const accepterVpcId = peeringConnection.peerVpcId;
            const requesterVpcId = peeringConnection.vpcId;

            // Skip if we're filtering by specific VPC IDs and neither VPC in this peering connection is in the list
            if (specificVpcIds.length > 0 &&
        !specificVpcIds.includes(accepterVpcId) &&
        !specificVpcIds.includes(requesterVpcId)) {
                return;
            }

            // Check DNS resolution settings - both must be enabled for compliance
            const accepterDnsResolution = peeringConnection.accepter?.allowRemoteVpcDnsResolution === true;
            const requesterDnsResolution = peeringConnection.requester?.allowRemoteVpcDnsResolution === true;

            // Report violation if either direction of DNS resolution is not enabled
            if (!accepterDnsResolution) {
                const pcName = peeringConnection.tags?.Name || `(accepter: ${peeringConnection.peerVpcId}, requester: ${peeringConnection.vpcId})`;
                reportViolation(
                    `VPC Peering Connection '${pcName}' does not have DNS resolution enabled for accepter VPC. ` +
          "DNS resolution should be enabled for VPC peering connections to allow instances to resolve DNS hostnames to private IP addresses. " +
          "Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-peering-dns-resolution-check.html"
                );
            }

            if (!requesterDnsResolution) {
                const pcName = peeringConnection.tags?.Name || `(accepter: ${peeringConnection.peerVpcId}, requester: ${peeringConnection.vpcId})`;
                reportViolation(
                    `VPC Peering Connection '${pcName}' does not have DNS resolution enabled for requester VPC. ` +
          "DNS resolution should be enabled for VPC peering connections to allow instances to resolve DNS hostnames to private IP addresses. " +
          "Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-peering-dns-resolution-check.html"
                );
            }
        }),
    },
    vendors: ["aws"],
    services: ["vpc"],
    severity: "medium",
    topics: ["network", "security"],
    frameworks: ["cis", "nist800-53", "pcidss"],
});
