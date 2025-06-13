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

import { StackValidationPolicy, ResourceValidationPolicy } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Configuration for vpc-flow-logs-enabled policy.
 */
interface VpcFlowLogsEnabledConfig {
    trafficType?: string;
    vpcIds?: string[];
}

export const enableFlowLogsStackPolicy: StackValidationPolicy = {
    name: "aws-vpc-vpc-enable-flow-logs",
    description: "Checks if Amazon VPC Flow Logs are enabled for your VPCs to monitor network traffic.",
    configSchema: {
        properties: {
            trafficType: {
                type: "string",
                description: "The type of traffic to log (ACCEPT, REJECT, or ALL)",
                default: "ALL",
                enum: ["ACCEPT", "REJECT", "ALL"],
            },
            vpcIds: {
                type: "array",
                items: { type: "string" },
                description: "Optional list of specific VPC IDs to check. If not provided, all VPCs are checked.",
                default: [],
            },
        },
    },
    enforcementLevel: "advisory",
    validateStack: (args, reportViolation) => {
        // Get configuration or use defaults
        const config = args.getConfig<VpcFlowLogsEnabledConfig>() || {};
        const trafficType = config.trafficType || "ALL";
        const specificVpcIds = config.vpcIds || [];

        // Find all VPCs in the stack
        const vpcs = args.resources.filter(r => r.type === "aws:ec2/vpc:Vpc");

        // If no VPCs in the stack, there's nothing to evaluate
        if (vpcs.length === 0) {
            return;
        }

        // Find all Flow Logs in the stack
        const flowLogs = args.resources.filter(r => r.type === "aws:ec2/flowLog:FlowLog");

        // Filter VPCs if specific IDs were provided in the config
        const vpcsToCheck = specificVpcIds.length > 0
            ? vpcs.filter(vpc => specificVpcIds.includes(vpc.props.id))
            : vpcs;

        // Check each VPC for flow logs
        for (const vpc of vpcsToCheck) {
            const vpcId = vpc.props.id;
            const vpcName = vpc.props.tags?.Name || vpc.props.name || vpc.props.id || vpc.urn;

            // Check if flow log exists for this VPC
            const hasFlowLog = flowLogs.some(log => {
                const props = log.props || {};

                // First check if this flow log is for our VPC
                const isForVpc = props.vpcId === vpcId ||
                    (props.resourceId === vpcId && props.resourceType === "VPC");

                // If traffic type is specified, check it matches
                const matchesTrafficType = !trafficType ||
                    !props.trafficType ||
                    props.trafficType === trafficType;

                return isForVpc && matchesTrafficType;
            });

            // If no flow log exists for this VPC, report a violation
            if (!hasFlowLog) {
                const trafficTypeMessage = trafficType
                    ? ` with traffic type '${trafficType}'`
                    : "";

                reportViolation(
                    `VPC '${vpcName}' does not have flow logs enabled${trafficTypeMessage}. ` +
                    "Flow logs are essential for monitoring, security analysis, and troubleshooting connectivity issues. " +
                    "Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-flow-logs-enabled.html"
                );
            }
        }
    },
};

/**
 * Checks if Amazon VPC Flow Logs are enabled for your VPCs to monitor network traffic.
 *
 * @severity medium
 * @frameworks cis, nist800-53, pcidss
 * @topics network, security
 * @link https://docs.aws.amazon.com/config/latest/developerguide/vpc-flow-logs-enabled.html
 */
export const enableFlowLogs: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-vpc-vpc-enable-flow-logs",
        description: "Checks if Amazon VPC Flow Logs are enabled for your VPCs to monitor network traffic.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: () => {
            // This is a stack-level policy, not a resource-level policy
            // The actual validation logic is in enableFlowLogsStackPolicy
        },
    },
    vendors: ["aws"],
    services: ["vpc"],
    severity: "medium",
    topics: ["network", "security"],
    frameworks: ["cis", "nist800-53", "pcidss"],
});
