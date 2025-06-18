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

describe("aws.vpc.Vpc.enableFlowLogs", function() {
    const policy = policies.aws.vpc.Vpc.enableFlowLogs;

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
        const args = getResourceValidationArgs("test-vpc", undefined, true);

        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        // VPC without flow logs should fail
        const args = getResourceValidationArgs("test-vpc", undefined, false);

        await assertHasResourceViolation(policy, args, { message: "does not have flow logs enabled" });
    });

    it("#3", async function() {
        // VPC with enableFlowLogs property should pass
        const args = getResourceValidationArgs("test-vpc", undefined, false, true);

        await assertNoResourceViolations(policy, args);
    });

    it("#4", async function() {
        // VPC without flow logs and specific vpcIds config should fail
        const args = getResourceValidationArgs("test-vpc", {
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        }, false);

        // Override getConfig to specify this VPC ID
        args.getConfig = <T>() => ({
            trafficType: "ALL",
            vpcIds: ["vpc-12345678"], // This VPC should be checked
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        } as T);

        args.urn = "urn:pulumi:dev::test::aws:ec2/vpc:Vpc::vpc-12345678";

        await assertHasResourceViolation(policy, args, { message: "does not have flow logs enabled" });
    });

    it("#5", async function() {
        // VPC with flow logs and specific vpcIds config should pass
        const args = getResourceValidationArgs("test-vpc", {
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        }, true);

        // Override getConfig to specify this VPC ID
        args.getConfig = <T>() => ({
            trafficType: "ALL",
            vpcIds: ["vpc-12345678"], // This VPC should be checked
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        } as T);

        args.urn = "urn:pulumi:dev::test::aws:ec2/vpc:Vpc::vpc-12345678";

        await assertNoResourceViolations(policy, args);
    });

    it("#6", async function() {
        // VPC not in vpcIds list should pass (filtered out)
        const args = getResourceValidationArgs("test-vpc", {
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        }, false);

        // Override getConfig to specify different VPC IDs
        args.getConfig = <T>() => ({
            trafficType: "ALL",
            vpcIds: ["vpc-different"], // This VPC should NOT be checked
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        } as T);

        args.urn = "urn:pulumi:dev::test::aws:ec2/vpc:Vpc::test-vpc";

        await assertNoResourceViolations(policy, args);
    });


});
