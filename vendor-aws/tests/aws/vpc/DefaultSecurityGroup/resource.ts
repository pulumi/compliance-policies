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
 * Create a `ResourceValidationArgs` for testing default security group policy.
 *
 * @param resourceName Name of the resource.
 * @param policyconfig Policy configuration.
 * @param hasIngressRules Whether to include ingress rules.
 * @param hasEgressRules Whether to include egress rules.
 * @param isDefault Whether this is a default security group.
 * @param useNamePrefix Whether to use namePrefix instead of name.
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(
    resourceName?: string,
    policyconfig?: PolicyConfigSchemaArgs,
    hasIngressRules: boolean = false,
    hasEgressRules: boolean = false,
    isDefault: boolean = true,
    useNamePrefix: boolean = false
): ResourceValidationArgs {
    const ingress = hasIngressRules ? [{
        description: "Test ingress rule",
        fromPort: 80,
        toPort: 80,
        protocol: "tcp",
        cidrBlocks: ["0.0.0.0/0"],
    }] : [];

    const egress = hasEgressRules ? [{
        fromPort: 0,
        toPort: 0,
        protocol: "-1",
        cidrBlocks: ["0.0.0.0/0"],
        description: "Test egress rule",
    }] : [];

    const props: any = {
        description: isDefault ? "default VPC security group" : "Custom security group",
        vpcId: enums.ec2.vpcId,
        ingress: ingress,
        egress: egress,
        tags: {
            Name: isDefault ? "default" : "custom",
        },
    };

    if (useNamePrefix) {
        props.namePrefix = "default";
    } else {
        props.name = isDefault ? "default" : "custom";
    }

    return createResourceValidationArgs(aws.ec2.SecurityGroup, props, policyconfig, resourceName);
}
