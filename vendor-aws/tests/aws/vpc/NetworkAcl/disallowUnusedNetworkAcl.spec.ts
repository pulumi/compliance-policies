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

describe("aws.vpc.NetworkAcl.disallowUnusedNetworkAcl", function() {
    const policy = policies.aws.vpc.NetworkAcl.disallowUnusedNetworkAcl;

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
        // Network ACL without subnetIds should fail (appears unused)
        const args = getResourceValidationArgs(undefined, undefined, false, false);

        await assertHasResourceViolation(policy, args, { message: "appears to be unused" });
    });

    it("#2", async function() {
        // Network ACL with subnetIds should pass
        const args = getResourceValidationArgs(undefined, undefined, false, true);

        await assertNoResourceViolations(policy, args);
    });

    it("#3", async function() {
        // Default Network ACL should pass (skipped)
        const args = getResourceValidationArgs(undefined, undefined, true, false);

        await assertNoResourceViolations(policy, args);
    });

    it("#4", async function() {
        // Network ACL with tags.default should pass (skipped)
        const args = getResourceValidationArgs(undefined, undefined, false, false);
        args.props.tags.default = true;

        await assertNoResourceViolations(policy, args);
    });

    it("#5", async function() {
        // Network ACL with custom name but no subnetIds should fail
        const args = getResourceValidationArgs("custom-acl", undefined, false, false);

        await assertHasResourceViolation(policy, args, { message: "appears to be unused" });
    });
});
