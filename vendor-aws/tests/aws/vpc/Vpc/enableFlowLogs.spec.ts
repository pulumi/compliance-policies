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
import { assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality, assertHasStackViolation, assertNoStackViolations } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getStackValidationArgs } from "./resource";

describe("aws.vpc.Vpc.enableFlowLogs", function() {
	const policy = policies.aws.vpc.Vpc.enableFlowLogs;
	const stackPolicy = policies.aws.vpc.Vpc.enableFlowLogsStackPolicy;

	it("name", async function() {
		assertResourcePolicyName(policy, "aws-vpc-vpc-enable-flow-logs");
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
		// VPC with flow logs enabled should pass
		const args = getStackValidationArgs("ALL", true);

		await assertNoStackViolations(stackPolicy, args);
	});

	it("#2", async function() {
		// VPC without flow logs should fail
		const args = getStackValidationArgs("ALL", false);

		await assertHasStackViolation(stackPolicy, args, { message: "does not have flow logs enabled" });
	});

	it("#3", async function() {
		// VPC with flow logs using vpcId property should pass
		const args = getStackValidationArgs("ALL", true, [], true);

		await assertNoStackViolations(stackPolicy, args);
	});

	it("#4", async function() {
		// VPC with flow logs but wrong traffic type should fail
		const args = getStackValidationArgs("ACCEPT", true, [], false, "REJECT");

		await assertHasStackViolation(stackPolicy, args, { message: "does not have flow logs enabled" });
	});

	it("#5", async function() {
		// VPC with flow logs matching traffic type should pass
		const args = getStackValidationArgs("ACCEPT", true, [], false, "ACCEPT");

		await assertNoStackViolations(stackPolicy, args);
	});

	it("#6", async function() {
		// No VPCs in stack should pass (nothing to evaluate)
		const args = {
			resources: [],
			getConfig: <T>() => ({
				trafficType: "ALL",
				vpcIds: [],
				includeFor: [],
				excludeFor: [],
				ignoreCase: false,
			} as T),
		} as unknown as any;

		await assertNoStackViolations(stackPolicy, args);
	});

	it("#7", async function() {
		// VPC filtered out by vpcIds should pass
		const args = getStackValidationArgs("ALL", false, ["vpc-different"]);

		await assertNoStackViolations(stackPolicy, args);
	});

	it("#8", async function() {
		// VPC included in vpcIds without flow logs should fail
		const args = getStackValidationArgs("ALL", false, ["vpc-12345678"]);

		await assertHasStackViolation(stackPolicy, args, { message: "does not have flow logs enabled" });
	});
});
