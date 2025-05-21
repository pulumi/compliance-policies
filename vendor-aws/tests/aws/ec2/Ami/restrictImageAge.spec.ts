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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getResourceValidationArgs } from "./resource";

describe("aws.ec2.Ami.restrictImageAge", function() {
    const policy = policies.aws.ec2.Ami.restrictImageAge;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ec2-ami-restrict-image-age");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ec2"],
            severity: "medium",
            topics: ["security", "compliance"],
            frameworks: ["cis"],
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
        await assertNoResourceViolations(policy, args);
    });

    it("policy-config-exclude", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "some-resource" ],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("#1 - recent creation date passes", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2 - old creation date fails", async function() {
        const args = getResourceValidationArgs();
        // Set date to 100 days in the past
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 100);
        args.props.creationDate = pastDate.toISOString();
        await assertHasResourceViolation(policy, args, { message: /AMI is \d+ days old, which exceeds the maximum allowed age of 90 days/ });
    });

    it("#3 - custom maxAgeInDays passes with recent image", async function() {
        const args = getResourceValidationArgs();
        args.getConfig = () => ({ maxAgeInDays: 30 });
        await assertNoResourceViolations(policy, args);
    });

    it("#4 - custom maxAgeInDays fails with older image", async function() {
        const args = getResourceValidationArgs();
        args.getConfig = () => ({ maxAgeInDays: 30 });
        // Set date to 40 days in the past
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 40);
        args.props.creationDate = pastDate.toISOString();
        await assertHasResourceViolation(policy, args, { message: /AMI is \d+ days old, which exceeds the maximum allowed age of 30 days/ });
    });

    it("#5 - no creation date reports violation", async function() {
        const args = getResourceValidationArgs();
        args.props.creationDate = undefined;
        await assertHasResourceViolation(policy, args, { message: "AMI creation date is not available, unable to determine image age" });
    });
});
