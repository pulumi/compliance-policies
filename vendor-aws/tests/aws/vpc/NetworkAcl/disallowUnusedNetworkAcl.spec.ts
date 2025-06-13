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

describe("aws.vpc.NetworkAcl.disallowUnusedNetworkAcl", function() {
    const policy = policies.aws.vpc.NetworkAcl.disallowUnusedNetworkAcl;
    const stackPolicy = policies.aws.vpc.NetworkAcl.disallowUnusedNetworkAclStackPolicy;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-vpc-networkacl-disallow-unused-network-acl");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["vpc"],
            severity: "low",
            topics: ["network", "security"],
            frameworks: ["cis", "nist800-53"],
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
        // Unused ACL should fail
        const args = getStackValidationArgs(true, false, false, false);

        await assertHasStackViolation(stackPolicy, args, { message: "is not associated with any subnet" });
    });

    it("#2", async function() {
        // Used ACL with association should pass
        const args = getStackValidationArgs(false, true, false, false);

        await assertNoStackViolations(stackPolicy, args);
    });

    it("#3", async function() {
        // Default ACL should be skipped (pass)
        const args = getStackValidationArgs(false, false, true, false);

        await assertNoStackViolations(stackPolicy, args);
    });

    it("#4", async function() {
        // ACL with direct subnet associations should pass
        const args = getStackValidationArgs(false, false, false, true);

        await assertNoStackViolations(stackPolicy, args);
    });

    it("#5", async function() {
        // Mix of used and unused ACLs should fail for unused
        const args = getStackValidationArgs(true, true, false, false);

        await assertHasStackViolation(stackPolicy, args, { message: "is not associated with any subnet" });
    });

    it("#6", async function() {
        // Mix of default and unused ACLs should fail for unused only
        const args = getStackValidationArgs(true, false, true, false);

        await assertHasStackViolation(stackPolicy, args, { message: "is not associated with any subnet" });
    });

    it("#7", async function() {
        // No Network ACLs should pass (nothing to evaluate)
        const args = {
            resources: [],
            getConfig: <T>() => ({
                includeFor: [],
                excludeFor: [],
                ignoreCase: false,
            } as T),
        } as unknown as any;

        await assertNoStackViolations(stackPolicy, args);
    });

    it("#8", async function() {
        // All ACL types together should only fail for unused ACL
        const args = getStackValidationArgs(true, true, true, true);

        await assertHasStackViolation(stackPolicy, args, { message: "is not associated with any subnet" });
    });
});
