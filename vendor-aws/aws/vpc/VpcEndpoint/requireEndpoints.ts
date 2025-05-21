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

import { StackValidationPolicy } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Configuration for vpc-endpoint-enabled policy
 */
interface VpcEndpointEnabledConfig {
  services?: string[];
  vpcIds?: string[];
}

/**
 * Checks if required VPC endpoints are enabled for your VPCs.
 *
 * @severity medium
 * @frameworks nist800-53, pcidss
 * @topics network, security
 * @link https://docs.aws.amazon.com/config/latest/developerguide/vpc-endpoint-enabled.html
 */
export const requireEndpoints: StackValidationPolicy = {
  name: "aws-vpc-require-endpoints",
  description: "Checks if required VPC endpoints are enabled for your VPCs.",
  configSchema: {
    properties: {
      services: {
        type: "array",
        items: { type: "string" },
        description: "List of service names required for VPC endpoints",
        default: ["s3", "dynamodb", "ecr.api", "ecr.dkr", "ecs", "logs", "ssm", "secretsmanager", "sqs", "sns"],
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
    // Skip validation if we're not supposed to evaluate this policy
    const policyArgs = {
      name: "aws-vpc-require-endpoints",
      type: "pulumi:pulumi:Stack",
      urn: "urn:pulumi:stack::project::pulumi:pulumi:Stack"
    } as any;

    if (!policyManager.shouldEvalPolicy(policyArgs)) {
      return;
    }

    // Get configuration or use defaults
    const config = args.getConfig<VpcEndpointEnabledConfig>() || {};
    const requiredServices = config.services || ["s3", "dynamodb", "ecr.api", "ecr.dkr", "ecs", "logs", "ssm", "secretsmanager", "sqs", "sns"];
    const specificVpcIds = config.vpcIds || [];

    // Find all VPCs in the stack
    const vpcs = args.resources.filter(r => r.type === "aws:ec2/vpc:Vpc");

    // If no VPCs in the stack, there's nothing to evaluate
    if (vpcs.length === 0) {
      return;
    }

    // Find all VPC endpoints in the stack
    const vpcEndpoints = args.resources.filter(r => r.type === "aws:ec2/vpcEndpoint:VpcEndpoint");

    // Filter VPCs if specific IDs were provided in the config
    const vpcsToCheck = specificVpcIds.length > 0
      ? vpcs.filter(vpc => specificVpcIds.includes(vpc.props.id))
      : vpcs;

    // Check each VPC for the required endpoints
    for (const vpc of vpcsToCheck) {
      const vpcId = vpc.props.id;
      const vpcName = vpc.props.tags?.Name || vpc.props.name || vpc.props.id || vpc.urn;

      // Check for each required service
      for (const service of requiredServices) {
        // See if we have an endpoint for this VPC and service
        const hasEndpoint = vpcEndpoints.some(endpoint => {
          const props = endpoint.props || {};
          return props.vpcId === vpcId &&
            props.serviceName &&
            typeof props.serviceName === 'string' &&
            props.serviceName.includes(service);
        });

        // If no endpoint exists for this service, report a violation
        if (!hasEndpoint) {
          reportViolation(
            `VPC '${vpcName}' does not have a required VPC endpoint for the '${service}' service. ` +
            "VPC endpoints improve security by keeping traffic within the AWS network." +
						"Read more here: https://docs.aws.amazon.com/config/latest/developerguide/vpc-endpoint-enabled.html"
          );
        }
      }
    }
  }
};

export const policy = policyManager.registerPolicy({
  resourceValidationPolicy: requireEndpoints as any,
  vendors: ["aws"],
  services: ["vpc"],
  severity: "medium",
  topics: ["network", "security"],
  frameworks: ["nist800-53", "pcidss"],
});