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
import { StackValidationArgs, ResourceValidationArgs } from "@pulumi/policy";
import { PolicyConfigSchemaArgs } from "@pulumi/compliance-policy-manager";
import { createResourceValidationArgs } from "@pulumi/compliance-policies-unit-test-helpers";

/**
 * Create a Network ACL resource for stack validation tests.
 *
 * @param id Network ACL ID.
 * @param name Network ACL name.
 * @param isDefault Whether this is a default ACL.
 * @param hasDirectSubnetIds Whether to include subnetIds directly.
 * @returns A Network ACL resource configuration.
 */
export function getNetworkAclResource(
    id: string = "acl-12345678",
    name: string = "test-acl",
    isDefault: boolean = false,
    hasDirectSubnetIds: boolean = false
): any {
    const props: any = {
        id: id,
        vpcId: "vpc-12345678",
        tags: {
            Name: name,
        },
        default: isDefault,
    };

    if (hasDirectSubnetIds) {
        props.subnetIds = ["subnet-12345678"];
    }

    return {
        type: "aws:ec2/networkAcl:NetworkAcl",
        name: name,
        props: props,
        urn: `urn:pulumi:dev::test::aws:ec2/networkAcl:NetworkAcl::${name}`,
        options: {},
        isPreview: false,
    };
}

/**
 * Create a Network ACL Association resource for stack validation tests.
 *
 * @param networkAclId Network ACL ID.
 * @param subnetId Subnet ID.
 * @param name Association name.
 * @returns A Network ACL Association resource configuration.
 */
export function getNetworkAclAssociationResource(
    networkAclId: string = "acl-12345678",
    subnetId: string = "subnet-12345678",
    name: string = "test-association"
): any {
    return {
        type: "aws:ec2/networkAclAssociation:NetworkAclAssociation",
        name: name,
        props: {
            networkAclId: networkAclId,
            subnetId: subnetId,
        },
        urn: `urn:pulumi:dev::test::aws:ec2/networkAclAssociation:NetworkAclAssociation::${name}`,
        options: {},
        isPreview: false,
    };
}

/**
 * Create a `StackValidationArgs` for testing Network ACL unused check policies.
 *
 * @param includeUnusedAcl Whether to include an unused ACL.
 * @param includeUsedAcl Whether to include a used ACL.
 * @param includeDefaultAcl Whether to include a default ACL.
 * @param includeAclWithDirectSubnets Whether to include ACL with direct subnet associations.
 * @returns A `StackValidationArgs` with Network ACL and optional association resources.
 */
export function getStackValidationArgs(
    includeUnusedAcl: boolean = true,
    includeUsedAcl: boolean = false,
    includeDefaultAcl: boolean = false,
    includeAclWithDirectSubnets: boolean = false
): StackValidationArgs {
    const resources: any[] = [];

    // Add unused ACL
    if (includeUnusedAcl) {
        resources.push(getNetworkAclResource("acl-unused", "unused-acl", false, false));
    }

    // Add used ACL with association
    if (includeUsedAcl) {
        resources.push(getNetworkAclResource("acl-used", "used-acl", false, false));
        resources.push(getNetworkAclAssociationResource("acl-used", "subnet-12345678", "used-association"));
    }

    // Add default ACL (should be skipped)
    if (includeDefaultAcl) {
        resources.push(getNetworkAclResource("acl-default", "default-acl", true, false));
    }

    // Add ACL with direct subnet IDs
    if (includeAclWithDirectSubnets) {
        resources.push(getNetworkAclResource("acl-direct", "direct-acl", false, true));
    }

    return {
        resources: resources,
        getConfig: <T>() => ({
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        } as T),
    } as unknown as StackValidationArgs;
}

/**
 * Create a `ResourceValidationArgs` for testing Network ACL unused check policy.
 *
 * @param resourceName Name of the Network ACL resource.
 * @param policyconfig Policy configuration.
 * @param isDefault Whether this is a default ACL.
 * @param hasSubnetIds Whether to include subnetIds directly.
 * @returns A `ResourceValidationArgs` with Network ACL resource.
 */
export function getResourceValidationArgs(
    resourceName?: string,
    policyconfig?: PolicyConfigSchemaArgs,
    isDefault: boolean = false,
    hasSubnetIds: boolean = false
): ResourceValidationArgs {
    const props: any = {
        vpcId: "vpc-12345678",
        tags: {
            Name: resourceName || "test-acl",
        },
    };

    if (isDefault) {
        props.tags.default = "true";
    }

    if (hasSubnetIds) {
        props.subnetIds = ["subnet-12345678"];
    }

    return createResourceValidationArgs(aws.ec2.NetworkAcl, props, policyconfig, resourceName);
}
