// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import "mocha";
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi-premium-policies/unit-test-helpers";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.apigatewayv2.DomainName, {
        domainName: "api.example.com",
        domainNameConfiguration: {
            certificateArn: enums.acm.certificateArn,
            endpointType: "REGIONAL",
            securityPolicy: "TLS_1_2",
        },
    });
}

describe("aws.apigatewayv2.DomainName.enableDomainNameConfiguration", function() {
    const policy = policies.aws.apigatewayv2.DomainName.enableDomainNameConfiguration;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-apigatewayv2-domainname-enable-domain-name-configuration");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["apigatewayv2"],
            severity: "high",
            topics: ["network"],
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
        args.props.domainNameConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "API GatewayV2 Domain Name Configuration should be enabled." });
    });
});

describe("aws.apigatewayv2.DomainName.configureDomainNameSecurityPolicy", function() {
    const policy = policies.aws.apigatewayv2.DomainName.configureDomainNameSecurityPolicy;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-apigatewayv2-domainname-configure-domain-name-security-policy");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["apigatewayv2"],
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
        args.props.domainNameConfiguration.securityPolicy = "TLS_1_0";
        await assertHasResourceViolation(policy, args, { message: "API GatewayV2 Domain Name Security Policy should use secure/modern TLS encryption." });
    });
});
