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
 * Create a `ResourceValidationArgs` for testing VPC peering connection DNS resolution policy.
 *
 * @param resourceName Name of the resource.
 * @param policyconfig Policy configuration.
 * @param accepterDnsResolution Whether accepter DNS resolution is enabled.
 * @param requesterDnsResolution Whether requester DNS resolution is enabled.
 * @param vpcId VPC ID for the requester.
 * @param peerVpcId VPC ID for the accepter.
 * @param hasName Whether to include a name tag.
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(
    resourceName?: string,
    policyconfig?: PolicyConfigSchemaArgs,
    accepterDnsResolution: boolean = true,
    requesterDnsResolution: boolean = true,
    vpcId: string = "vpc-12345678",
    peerVpcId: string = "vpc-87654321",
    hasName: boolean = true
): ResourceValidationArgs {
    const props: any = {
        vpcId: vpcId,
        peerVpcId: peerVpcId,
        accepter: {
            allowRemoteVpcDnsResolution: accepterDnsResolution,
        },
        requester: {
            allowRemoteVpcDnsResolution: requesterDnsResolution,
        },
    };

    if (hasName) {
        props.tags = {
            Name: "test-peering-connection",
        };
    }

    return createResourceValidationArgs(aws.ec2.VpcPeeringConnection, props, policyconfig, resourceName);
}
