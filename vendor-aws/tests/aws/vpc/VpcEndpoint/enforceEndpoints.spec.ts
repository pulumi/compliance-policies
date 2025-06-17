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

describe("aws.vpc.VpcEndpoint.enforceEndpoints", function() {
    const policy = policies.aws.vpc.VpcEndpoint.enforceEndpoints;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-vpc-vpcendpoint-enforce-endpoints");
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
            frameworks: ["nist800-53", "pcidss"],
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
        // VPC endpoint with proper vpcEndpointType should pass
        const args = getResourceValidationArgs("s3-endpoint", undefined, "vpc-12345678", "s3", true);

        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        // VPC endpoint without vpcEndpointType should fail
        const args = getResourceValidationArgs("s3-endpoint", undefined, "vpc-12345678", "s3", false);

        await assertHasResourceViolation(policy, args, { message: "does not have a VPC endpoint type specified" });
    });

    it("#3", async function() {
        // VPC endpoint filtered out by vpcIds should pass
        const args = getResourceValidationArgs("s3-endpoint", {
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        }, "vpc-12345678", "s3", true);

        // Override getConfig to filter to different VPC IDs
        args.getConfig = <T>() => ({
            services: ["s3", "dynamodb"],
            vpcIds: ["vpc-different"],
            includeFor: [],
            excludeFor: [],
            ignoreCase: false,
        } as T);

        await assertNoResourceViolations(policy, args);
    });

    it("#4", async function() {
        // VPC endpoint with full AWS service name should pass
        const args = getResourceValidationArgs("s3-endpoint", undefined, "vpc-12345678", "com.amazonaws.us-west-2.s3", true);

        await assertNoResourceViolations(policy, args);
    });
});
