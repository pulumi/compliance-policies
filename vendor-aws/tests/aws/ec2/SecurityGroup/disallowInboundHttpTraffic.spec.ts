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

describe("aws.ec2.SecurityGroup.disallowInboundHttpTraffic", function() {
    const policy = policies.aws.ec2.SecurityGroup.disallowInboundHttpTraffic;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-securitygroup-disallow-inbound-http-traffic");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "critical",
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

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.ingress[0].fromPort = 80;
        args.props.ingress[0].toPort = 80;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not allow ingress HTTP traffic." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.ingress[0].fromPort = 79;
        args.props.ingress[0].toPort = 81;
        await assertHasResourceViolation(policy, args, { message: "EC2 Security Groups should not allow ingress HTTP traffic." });
    });
});
