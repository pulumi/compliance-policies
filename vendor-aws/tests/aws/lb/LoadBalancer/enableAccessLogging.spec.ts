// Copyright 2016-2024, Pulumi Corporation.
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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails,  assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import { getResourceValidationArgs } from "./resource";

describe("aws.lb.LoadBalancer.enableAccessLogging", function() {
    const policy = policies.aws.lb.LoadBalancer.enableAccessLogging;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-lb-loadbalancer-enable-access-logging");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["lb"],
            severity: "medium",
            topics: ["network", "logging"],
            frameworks: ["pcidss", "iso27001"],
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

    it("policy-config-include", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "corp-resource" ],
        });
        args.props.accessLogs = undefined;
        await assertHasResourceViolation(policy, args, { message: "LoadBalancers should have access logging enabled." });
    });

    it("policy-config-exclude", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "some-resource" ],
        });
        args.props.accessLogs = undefined;
        await assertNoResourceViolations(policy, args);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.accessLogs = undefined;
        await assertHasResourceViolation(policy, args, { message: "LoadBalancers should have access logging enabled." });
    });
});
