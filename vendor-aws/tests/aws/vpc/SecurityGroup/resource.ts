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

/* eslint-disable jsdoc/no-restricted-syntax */

import * as aws from "@pulumi/aws";
import { ResourceValidationArgs } from "@pulumi/policy";
import { PolicyConfigSchemaArgs } from "@pulumi/compliance-policy-manager";
import * as enums from "../../enums";
import { createResourceValidationArgs } from "@pulumi/compliance-policies-unit-test-helpers";

/**
 * Create a `ResourceValidationArgs` for testing VPC security group authorized ports policy.
 *
 * @param resourceName Name of the resource.
 * @param policyconfig Policy configuration.
 * @param hasGlobalTcpRule Whether to include a global TCP rule.
 * @param tcpPort TCP port number for the rule.
 * @param hasGlobalUdpRule Whether to include a global UDP rule.
 * @param udpPort UDP port number for the rule.
 * @param hasAllProtocolRule Whether to include an all protocol rule.
 * @param hasPortRange Whether to include a port range rule.
 * @param fromPort Starting port for range.
 * @param toPort Ending port for range.
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(
    resourceName?: string,
    policyconfig?: PolicyConfigSchemaArgs,
    hasGlobalTcpRule: boolean = false,
    tcpPort: number = 22,
    hasGlobalUdpRule: boolean = false,
    udpPort: number = 53,
    hasAllProtocolRule: boolean = false,
    hasPortRange: boolean = false,
    fromPort: number = 8080,
    toPort: number = 8090
): ResourceValidationArgs {
    const ingress: any[] = [];

    // Add global TCP rule
    if (hasGlobalTcpRule) {
        ingress.push({
            description: "Global TCP rule",
            fromPort: tcpPort,
            toPort: tcpPort,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"],
        });
    }

    // Add global UDP rule
    if (hasGlobalUdpRule) {
        ingress.push({
            description: "Global UDP rule",
            fromPort: udpPort,
            toPort: udpPort,
            protocol: "udp",
            cidrBlocks: ["0.0.0.0/0"],
        });
    }

    // Add all protocol rule
    if (hasAllProtocolRule) {
        ingress.push({
            description: "All protocols rule",
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
        });
    }

    // Add port range rule
    if (hasPortRange) {
        ingress.push({
            description: "Port range rule",
            fromPort: fromPort,
            toPort: toPort,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"],
        });
    }

    const securityGroupName = resourceName || "test-security-group";
    const props = {
        name: securityGroupName,
        description: "Test security group for authorized ports policy",
        vpcId: enums.ec2.vpcId,
        ingress: ingress,
        tags: {
            Name: securityGroupName,
        },
    };

    return createResourceValidationArgs(aws.ec2.SecurityGroup, props, policyconfig, resourceName);
}
