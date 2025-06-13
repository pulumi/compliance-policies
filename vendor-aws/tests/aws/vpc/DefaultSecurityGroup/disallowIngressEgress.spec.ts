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

describe("aws.vpc.DefaultSecurityGroup.disallowIngressEgress", function() {
    const policy = policies.aws.vpc.DefaultSecurityGroup.disallowIngressEgress;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-vpc-defaultsecuritygroup-disallow-ingress-egress");
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
            frameworks: ["nist800-53", "pcidss", "cis"],
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
        // Default security group with no rules should pass
        const args = getResourceValidationArgs(undefined, undefined, false, false, true, false);

        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        // Default security group with ingress rules should fail
        const args = getResourceValidationArgs(undefined, undefined, true, false, true, false);

        await assertHasResourceViolation(policy, args, { message: "inbound traffic rules" });
    });

    it("#3", async function() {
        // Default security group with egress rules should fail
        const args = getResourceValidationArgs(undefined, undefined, false, true, true, false);

        await assertHasResourceViolation(policy, args, { message: "outbound traffic rules" });
    });

    it("#4", async function() {
        // Default security group with both ingress and egress rules should fail
        const args = getResourceValidationArgs(undefined, undefined, true, true, true, false);

        await assertHasResourceViolation(policy, args, { message: "inbound traffic rules" });
    });

    it("#5", async function() {
        // Non-default security group with rules should pass
        const args = getResourceValidationArgs(undefined, undefined, true, true, false, false);

        await assertNoResourceViolations(policy, args);
    });

    it("#6", async function() {
        // Default security group with namePrefix and no rules should pass
        const args = getResourceValidationArgs(undefined, undefined, false, false, true, true);

        await assertNoResourceViolations(policy, args);
    });

    it("#7", async function() {
        // Default security group with namePrefix and ingress rules should fail
        const args = getResourceValidationArgs(undefined, undefined, true, false, true, true);

        await assertHasResourceViolation(policy, args, { message: "inbound traffic rules" });
    });

    it("#8", async function() {
        // Default security group with namePrefix and egress rules should fail
        const args = getResourceValidationArgs(undefined, undefined, false, true, true, true);

        await assertHasResourceViolation(policy, args, { message: "outbound traffic rules" });
    });
});
