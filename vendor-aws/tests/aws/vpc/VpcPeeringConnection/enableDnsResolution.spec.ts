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
import { assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality, assertHasResourceViolation, assertNoResourceViolations } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getResourceValidationArgs } from "./resource";

describe("aws.vpc.VpcPeeringConnection.enableDnsResolution", function() {
	const policy = policies.aws.vpc.VpcPeeringConnection.enableDnsResolution;

	it("name", async function() {
		assertResourcePolicyName(policy, "aws-vpc-vpcpeeringconnection-enable-dns-resolution");
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
			frameworks: ["cis", "nist800-53", "pcidss"],
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

	it("#1", async function() {
		// Both accepter and requester DNS resolution enabled should pass
		const args = getResourceValidationArgs(undefined, undefined, true, true);

		await assertNoResourceViolations(policy, args);
	});

	it("#2", async function() {
		// Accepter DNS resolution disabled should fail
		const args = getResourceValidationArgs(undefined, undefined, false, true);

		await assertHasResourceViolation(policy, args, { message: "does not have DNS resolution enabled for accepter VPC" });
	});

	it("#3", async function() {
		// Requester DNS resolution disabled should fail
		const args = getResourceValidationArgs(undefined, undefined, true, false);

		await assertHasResourceViolation(policy, args, { message: "does not have DNS resolution enabled for requester VPC" });
	});

	it("#4", async function() {
		// Both accepter and requester DNS resolution disabled should fail with both messages
		const args = getResourceValidationArgs(undefined, undefined, false, false);

		await assertHasResourceViolation(policy, args, { message: "does not have DNS resolution enabled for accepter VPC" });
	});

	it("#5", async function() {
		// Peering connection without name tag should use VPC IDs in message
		const args = getResourceValidationArgs(undefined, undefined, false, true, "vpc-12345678", "vpc-87654321", false);

		await assertHasResourceViolation(policy, args, { message: "(accepter: vpc-87654321, requester: vpc-12345678)" });
	});

	it("#6", async function() {
		// VPC filtering: should pass when filtered out
		const args = getResourceValidationArgs(undefined, {
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		}, false, false);

		// Override getConfig to include vpcIds
		args.getConfig = <T>() => ({
			vpcIds: ["vpc-different"],
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		} as T);

		await assertNoResourceViolations(policy, args);
	});

	it("#7", async function() {
		// VPC filtering: should fail when accepter VPC is included
		const args = getResourceValidationArgs(undefined, {
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		}, false, true);

		// Override getConfig to include vpcIds
		args.getConfig = <T>() => ({
			vpcIds: ["vpc-87654321"],
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		} as T);

		await assertHasResourceViolation(policy, args, { message: "does not have DNS resolution enabled for accepter VPC" });
	});

	it("#8", async function() {
		// VPC filtering: should fail when requester VPC is included
		const args = getResourceValidationArgs(undefined, {
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		}, true, false);

		// Override getConfig to include vpcIds
		args.getConfig = <T>() => ({
			vpcIds: ["vpc-12345678"],
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		} as T);

		await assertHasResourceViolation(policy, args, { message: "does not have DNS resolution enabled for requester VPC" });
	});
});
