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
import { StackValidationArgs } from "@pulumi/policy";
import { PolicyConfigSchemaArgs } from "@pulumi/compliance-policy-manager";

/**
 * Create a VPC resource for stack validation tests.
 *
 * @param id VPC ID.
 * @param name VPC name.
 * @returns A VPC resource configuration.
 */
export function getVpcResource(id: string = "vpc-12345678", name: string = "my-vpc"): any {
    return {
        type: "aws:ec2/vpc:Vpc",
        name: name,
        props: {
            id: id,
            cidrBlock: "10.0.0.0/16",
            tags: {
                Name: name,
            },
        },
        urn: `urn:pulumi:dev::test::aws:ec2/vpc:Vpc::${name}`,
        options: {},
        isPreview: false,
    };
}

/**
 * Create a VPC Flow Log resource for stack validation tests.
 *
 * @param vpcId VPC ID for the flow log.
 * @param trafficType Traffic type for the flow log.
 * @param name Name of the flow log resource.
 * @returns A VPC Flow Log resource configuration.
 */
export function getFlowLogResource(
    vpcId: string = "vpc-12345678",
    trafficType: string = "ALL",
    name: string = "vpc-flow-log"
): any {
    return {
        type: "aws:ec2/flowLog:FlowLog",
        name: name,
        props: {
            resourceId: vpcId,
            resourceType: "VPC",
            trafficType: trafficType,
            logDestinationType: "cloud-watch-logs",
            logGroupName: "/aws/vpc/flowlogs",
        },
        urn: `urn:pulumi:dev::test::aws:ec2/flowLog:FlowLog::${name}`,
        options: {},
        isPreview: false,
    };
}

/**
 * Create a VPC Flow Log resource using vpcId property.
 *
 * @param vpcId VPC ID for the flow log.
 * @param trafficType Traffic type for the flow log.
 * @param name Name of the flow log resource.
 * @returns A VPC Flow Log resource configuration.
 */
export function getFlowLogWithVpcIdResource(
    vpcId: string = "vpc-12345678",
    trafficType: string = "ALL",
    name: string = "vpc-flow-log"
): any {
    return {
        type: "aws:ec2/flowLog:FlowLog",
        name: name,
        props: {
            vpcId: vpcId,
            trafficType: trafficType,
            logDestinationType: "cloud-watch-logs",
            logGroupName: "/aws/vpc/flowlogs",
        },
        urn: `urn:pulumi:dev::test::aws:ec2/flowLog:FlowLog::${name}`,
        options: {},
        isPreview: false,
    };
}

/**
 * Create a `StackValidationArgs` for testing VPC flow logs policies.
 *
 * @param trafficType Traffic type requirement.
 * @param includeFlowLogs Whether to include flow logs.
 * @param vpcIds List of VPC IDs to filter by.
 * @param useVpcIdProperty Whether to use vpcId property instead of resourceId.
 * @param flowLogTrafficType Traffic type for the flow log.
 * @returns A `StackValidationArgs` with VPC and optional flow log resources.
 */
export function getStackValidationArgs(
    trafficType: string = "ALL",
    includeFlowLogs: boolean = true,
    vpcIds: string[] = [],
    useVpcIdProperty: boolean = false,
    flowLogTrafficType: string = "ALL"
): StackValidationArgs {
    // Create base resources array with VPC
    const resources = [getVpcResource()];

    // Add flow log if specified
    if (includeFlowLogs) {
        if (useVpcIdProperty) {
            resources.push(getFlowLogWithVpcIdResource("vpc-12345678", flowLogTrafficType));
        } else {
            resources.push(getFlowLogResource("vpc-12345678", flowLogTrafficType));
        }
    }

    return {
        resources: resources,
        getConfig: <T>() => ({
            trafficType: trafficType,
            vpcIds: vpcIds,
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        } as T),
    } as unknown as StackValidationArgs;
}
