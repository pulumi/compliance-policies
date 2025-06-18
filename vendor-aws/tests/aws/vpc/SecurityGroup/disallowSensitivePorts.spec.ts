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

describe("aws.vpc.SecurityGroup.disallowSensitivePorts", function() {
	const policy = policies.aws.vpc.SecurityGroup.disallowSensitivePorts;

	it("name", async function() {
		assertResourcePolicyName(policy, "aws-vpc-securitygroup-disallow-sensitive-ports");
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
		// Security group with non-sensitive TCP port (443) should pass
		const args = getResourceValidationArgs(undefined, undefined, true, 443);

		await assertNoResourceViolations(policy, args);
	});

	it("#3", async function() {
		// Security group with sensitive TCP port (22) should fail
		const args = getResourceValidationArgs(undefined, undefined, true, 22);

		await assertHasResourceViolation(policy, args, { message: "sensitive port(s): 22" });
	});

	it("#4", async function() {
		// Security group with sensitive TCP port (3389) should fail
		const args = getResourceValidationArgs(undefined, undefined, true, 3389);

		await assertHasResourceViolation(policy, args, { message: "sensitive port(s): 3389" });
	});

	it("#5", async function() {
		// Security group with sensitive UDP port should fail when protocol type is ALL
		const args = getResourceValidationArgs(undefined, undefined, false, 22, true, 22);

		await assertHasResourceViolation(policy, args, { message: "sensitive port(s): 22" });
	});

	it("#6", async function() {
		// Security group with sensitive UDP port should pass when protocol type is TCP
		const args = getResourceValidationArgs(undefined, {
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		}, false, 22, true, 22);

		// Override getConfig to check only TCP
		args.getConfig = <T>() => ({
			restrictPorts: "22,3389",
			protocolType: "TCP",
			ipType: "ALL",
			excludeExternalSecurityGroups: true,
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		} as T);

		await assertNoResourceViolations(policy, args);
	});

	it("#7", async function() {
		// Security group with port range including sensitive port should fail
		const args = getResourceValidationArgs(undefined, undefined, false, 22, false, 53, false, true, 20, 25);

		await assertHasResourceViolation(policy, args, { message: "sensitive port(s): 22" });
	});

	it("#8", async function() {
		// Custom configuration with different restricted ports should pass
		const args = getResourceValidationArgs(undefined, {
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		}, true, 22);

		// Override getConfig to use different restricted ports
		args.getConfig = <T>() => ({
			restrictPorts: "80,443",
			protocolType: "ALL",
			ipType: "ALL",
			excludeExternalSecurityGroups: true,
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		} as T);

		await assertNoResourceViolations(policy, args);
	});

	it("#9", async function() {
		// Security group with IPv6 global access on sensitive port should fail
		const args = getResourceValidationArgs(undefined, undefined, true, 22);

		// Modify the ingress rule to use IPv6
		args.props.ingress[0].cidrBlocks = ["::/0"];

		await assertHasResourceViolation(policy, args, { message: "sensitive port(s): 22" });
	});

	it("#10", async function() {
		// Security group with IPv4 only check should pass for IPv6 global access
		const args = getResourceValidationArgs(undefined, {
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		}, true, 22);

		// Modify the ingress rule to use IPv6
		args.props.ingress[0].cidrBlocks = ["::/0"];

		// Override getConfig to check only IPv4
		args.getConfig = <T>() => ({
			restrictPorts: "22,3389",
			protocolType: "ALL",
			ipType: "IPv4",
			excludeExternalSecurityGroups: true,
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		} as T);

		await assertNoResourceViolations(policy, args);
	});

	it("#11", async function() {
		// External security group should be excluded by default
		const args = getResourceValidationArgs("eks-cluster-sg-test", undefined, true, 22);

		await assertNoResourceViolations(policy, args);
	});

	it("#12", async function() {
		// External security group should fail when excludeExternalSecurityGroups is false
		const args = getResourceValidationArgs("eks-cluster-sg-test", {
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		}, true, 22);

		// Override getConfig to not exclude external security groups
		args.getConfig = <T>() => ({
			restrictPorts: "22,3389",
			protocolType: "ALL",
			ipType: "ALL",
			excludeExternalSecurityGroups: false,
			includeFor: [],
			excludeFor: [],
			ignoreCase: false,
		} as T);

		await assertHasResourceViolation(policy, args, { message: "sensitive port(s): 22" });
	});
});
