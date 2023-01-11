// Copyright 2016-2023, Pulumi Corporation.
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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi-premium-policies/unit-test-helpers";
import * as awsnative from "@pulumi/aws-native";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.apigateway.DomainName, {
        domainName: "api.example.com",
        endpointConfiguration: {
            types: ["REGIONAL"],
        },
        securityPolicy: "TLS_1_2",
        certificateArn: enums.acm.certificateArn,
    });
}

describe("awsnative.apigateway.DomainName.configureSecurityPolicy", function() {
    const policy = policies.awsnative.apigateway.DomainName.configureSecurityPolicy;

    it("name", async function() {
        assertResourcePolicyName(policy, "awsnative-apigateway-domainname-configure-security-policy");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["apigateway"],
            severity: "high",
            topics: ["network", "encryption"],
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
        args.props.securityPolicy = undefined;
        await assertHasResourceViolation(policy, args, { message: "API Gateway Domain Name Security Policy should use secure/modern TLS encryption." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.securityPolicy = "TLS_1_0";
        await assertHasResourceViolation(policy, args, { message: "API Gateway Domain Name Security Policy should use secure/modern TLS encryption." });
    });
});
