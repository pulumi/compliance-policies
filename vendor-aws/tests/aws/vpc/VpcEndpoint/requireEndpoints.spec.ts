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

import "mocha";
import { assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getStackValidationArgs } from "./resource";

describe("aws.vpc.VpcEndpoint.requireEndpoints", function() {
	const policy = policies.aws.vpc.VpcEndpoint.requireEndpoints;

	it("name", async function() {
		assertResourcePolicyName(policy, "aws-vpc-require-endpoints");
	});

	it("registration", async function() {
		assertResourcePolicyIsRegistered(policy);
	});

	it("metadata", async function() {
		assertResourcePolicyRegistrationDetails(policy, {
			vendors: ["aws"],
			services: ["vpc"],
			severity: "medium",
			topics: ["network", "security"],
			frameworks: ["nist800-53", "pcidss"],
		});
	});

	it("enforcementLevel", async function() {
		assertResourcePolicyEnforcementLevel(policy);
	});

	it("description", async function() {
		assertResourcePolicyDescription(policy);
	});

	it("code", async function () {
		assertCodeQuality(this.test?.parent?.title, __filename);
	});

	it("should error when VPC is missing required endpoints", async function() {
		// VPC with only s3 endpoint, but requiring s3 and dynamodb
		const args = getStackValidationArgs(["s3", "dynamodb"], ["s3"]);
		
		// Apply policy check
		let violations: any[] = [];
		await policy.validateStack(args, (message) => violations.push(message));

		// Check for violations - should have one for missing dynamodb endpoint
		expect(violations.length).toBe(1);
		expect(violations[0]).toContain("dynamodb");
	});

	it("should not error when VPC has all required endpoints", async function() {
		// VPC with both required endpoints
		const args = getStackValidationArgs(["s3", "dynamodb"], ["s3", "dynamodb"]);
		
		// Apply policy check
		let violations: any[] = [];
		await policy.validateStack(args, (message) => violations.push(message));

		// Check for violations
		expect(violations.length).toBe(0);
	});

	it("should respect VPC ID filtering", async function() {
		// No endpoints but filtered to a different VPC
		const args = getStackValidationArgs(["s3"], [], ["vpc-other"]);
		
		// Apply policy check
		let violations: any[] = [];
		await policy.validateStack(args, (message) => violations.push(message));

		// Check for violations - should be none because we're filtering for a different VPC
		expect(violations.length).toBe(0);
	});

	it("should handle different endpoint naming formats", async function() {
		// Use a custom stack validation args with full AWS service name
		const resources = [
			{
				type: "aws:ec2/vpc:Vpc",
				name: "my-vpc",
				props: {
						id: "vpc-12345678",
						cidrBlock: "10.0.0.0/16",
						tags: {
							Name: "my-vpc"
						}
				},
				urn: "urn:pulumi:dev::test::aws:ec2/vpc:Vpc::my-vpc",
				options: {},
				isPreview: false,
			},
			{
				type: "aws:ec2/vpcEndpoint:VpcEndpoint",
				name: "s3-endpoint",
				props: {
					vpcId: "vpc-12345678",
					serviceName: "com.amazonaws.us-west-2.s3", // Full AWS service name format
					vpcEndpointType: "Gateway"
				},
				urn: "urn:pulumi:dev::test::aws:ec2/vpcEndpoint:VpcEndpoint::s3-endpoint",
				options: {},
				isPreview: false,
			}
		];
			
		const args = {
			resources: resources,
			getConfig: () => ({ services: ["s3"] }), // Requiring just s3
		} as any;
		
		// Apply policy check
		let violations: any[] = [];
		await policy.validateStack(args, (message) => violations.push(message));

		// Check for violations - should be none because the s3 endpoint is present
		expect(violations.length).toBe(0);
	});
});