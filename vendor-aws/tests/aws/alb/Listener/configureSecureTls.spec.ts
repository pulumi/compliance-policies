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
import * as enums from "../../enums";
import { getResourceValidationArgs } from "./resource";

describe("aws.alb.Listener.configureSecureTls", function() {
    const policy = policies.aws.alb.Listener.configureSecureTls;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-alb-listener-configure-secure-tls");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["alb"],
            severity: "high",
            topics: ["network", "encryption"],
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
        args.props.sslPolicy = "ELBSecurityPolicy-FS-1-1-2019-08";
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should use secure/modern TLS encryption." });
    });

    it("policy-config-exclude", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "some-resource" ],
        });
        args.props.sslPolicy = "ELBSecurityPolicy-FS-1-1-2019-08";
        await assertNoResourceViolations(policy, args);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-TLS13-1-2-2021-06";
        await assertNoResourceViolations(policy, args);
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-TLS13-1-3-FIPS-2023-04";
        await assertNoResourceViolations(policy, args);
    });

    it("#4", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-TLS13-1-3-FIPS-2023-04";
        await assertNoResourceViolations(policy, args);
    });

    it("#5", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-TLS13-1-2-FIPS-2023-04";
        await assertNoResourceViolations(policy, args);
    });

    it("#6", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-FS-1-2-Res-2020-10";
        await assertNoResourceViolations(policy, args);
    });

    it("#7", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-FS-1-2-Res-2019-08";
        await assertNoResourceViolations(policy, args);
    });

    it("#8", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = undefined;
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should use secure/modern TLS encryption." });
    });

    it("#9", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-TLS-1-2-2017-01";
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should use secure/modern TLS encryption." });
    });

    it("#10", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-FS-1-1-2019-08";
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should use secure/modern TLS encryption." });
    });

    it("#11", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-FS-1-1-2019-08";
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should use secure/modern TLS encryption." });
    });
});
