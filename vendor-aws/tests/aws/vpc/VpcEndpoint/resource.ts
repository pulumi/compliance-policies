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

import * as aws from "@pulumi/aws";
import { ResourceValidationArgs, StackValidationArgs } from "@pulumi/policy";
import { PolicyConfigSchemaArgs } from "@pulumi/compliance-policy-manager";

/**
 * Create a VPC resource for stack validation tests
 * 
 * @returns A VPC resource configuration
 */
export function getVpcResource(id: string = "vpc-12345678", name: string = "my-vpc"): any {
return {
  type: "aws:ec2/vpc:Vpc",
  name: name,
  props: {
    id: id,
    cidrBlock: "10.0.0.0/16",
    tags: {
      Name: name
    }
  },
  urn: `urn:pulumi:dev::test::aws:ec2/vpc:Vpc::${name}`,
  options: {},
  isPreview: false,
};
}

/**
 * Create a VPC endpoint resource for stack validation tests
 * 
 * @returns A VPC endpoint resource configuration
 */
export function getVpcEndpointResource(
  vpcId: string = "vpc-12345678", 
  serviceName: string = "s3", 
  name: string = `${serviceName}-endpoint`
): any {
// Format the AWS service name if it's a simple service name
const formattedServiceName = serviceName.includes(".") ? 
  serviceName : 
  `com.amazonaws.us-west-2.${serviceName}`;

return {
  type: "aws:ec2/vpcEndpoint:VpcEndpoint",
  name: name,
  props: {
    vpcId: vpcId,
    serviceName: formattedServiceName,
    vpcEndpointType: "Gateway"
  },
  urn: `urn:pulumi:dev::test::aws:ec2/vpcEndpoint:VpcEndpoint::${name}`,
  options: {},
  isPreview: false,
};
}

/**
 * Create a `StackValidationArgs` for testing VPC endpoint policies
 *
 * @returns A `StackValidationArgs` with VPC and optional VPC endpoint resources
 */
export function getStackValidationArgs(
  services: string[] = ["s3", "dynamodb"],
  includeEndpoints: string[] = ["s3"],
  vpcIds: string[] = []
): StackValidationArgs {
// Create base resources array with VPC
const resources = [getVpcResource()];

// Add VPC endpoints for specified services
for (const service of includeEndpoints) {
  resources.push(getVpcEndpointResource("vpc-12345678", service));
}

return {
  resources: resources,
  getConfig: () => ({ 
    services: services,
    vpcIds: vpcIds
  }),
} as unknown as StackValidationArgs;
}