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

describe("aws.vpc.SecurityGroup.disallowUnauthorizedPorts", function() {
	const policy = policies.aws.vpc.SecurityGroup.disallowUnauthorizedPorts;

	it("name", async function() {
		assertResourcePolicyName(policy, "aws-vpc-securitygroup-disallow-unauthorized-ports");
	});

	it("registration", async function() {
		assertResourcePolicyIsRegistered(policy);
	});

	it("metadata", async function() {
		assertResourcePolicyRegistrationDetails(policy, {
			vendors: ["aws"],
			services: ["vpc"],
			severity: "high",
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
		// Security group with no ingress rules should pass
		const args = getResourceValidationArgs();

		await assertNoResourceViolations(policy, args);
	});

	it("#2", async function() {
		// Security group with authorized TCP port (443) should pass
		const args = getResourceValidationArgs(undefined, undefined, true, 443);

		await assertNoResourceViolations(policy, args);
	});

	it("#3", async function() {
		// Security group with authorized TCP port (80) should pass
		const args = getResourceValidationArgs(undefined, undefined, true, 80);

		await assertNoResourceViolations(policy, args);
	});

	it("#4", async function() {
	  // Security group with unauthorized TCP port (22) should fail
		const args = getResourceValidationArgs(undefined, undefined, true, 22);

		await assertHasResourceViolation(policy, args, { message: "unauthorized port 22" });
	});

	it("#5", async function() {
		// Security group with unauthorized UDP port should fail (no UDP ports authorized by default)
		const args = getResourceValidationArgs(undefined, undefined, false, 22, true, 53);

		await assertHasResourceViolation(policy, args, { message: "unauthorized port 53" });
	});

	it("#6", async function() {
		// Security group with all protocols should fail
		const args = getResourceValidationArgs(undefined, undefined, false, 22, false, 53, true);

		await assertHasResourceViolation(policy, args, { message: "allows unrestricted access" });
	});

	it("#7", async function() {
		// Security group with unauthorized port range should fail
		const args = getResourceValidationArgs(undefined, undefined, false, 22, false, 53, false, true, 8080, 8090);

		await assertHasResourceViolation(policy, args, { message: "unauthorized port 8080" });
	});

	it("#8", async function() {
		// Custom configuration with authorized UDP ports should pass
		const args = getResourceValidationArgs(undefined, {
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		}, false, 22, true, 53);

		// Override getConfig to include custom UDP ports
		args.getConfig = <T>() => ({
			authorizedTcpPorts: "443,80",
			authorizedUdpPorts: "53,123",
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		} as T);

		await assertNoResourceViolations(policy, args);
	});

	it("#9", async function() {
		// Custom configuration with port ranges should pass
		const args = getResourceValidationArgs(undefined, {
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		}, false, 22, false, 53, false, true, 8080, 8090);

		// Override getConfig to include port range
		args.getConfig = <T>() => ({
			authorizedTcpPorts: "443,80,8080-8090",
			authorizedUdpPorts: "",
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		} as T);

		await assertNoResourceViolations(policy, args);
	});

	it("#10", async function() {
		// Security group with IPv6 global access should fail
		const args = getResourceValidationArgs(undefined, undefined, true, 22);

		// Modify the ingress rule to use IPv6
		args.props.ingress[0].cidrBlocks = ["::/0"];

		await assertHasResourceViolation(policy, args, { message: "unauthorized port 22" });
	});
});
