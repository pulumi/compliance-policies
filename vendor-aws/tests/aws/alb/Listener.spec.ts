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
    return createResourceValidationArgs(aws.alb.Listener, {
        loadBalancerArn: enums.alb.loadBalancerArn,
        port: 443,
        protocol: "HTTPS",
        sslPolicy: "ELBSecurityPolicy-FS-1-2-2019-08", // TLSv1.2 and FS (Forward secrecy)
        defaultActions: [{
            type: "forward",
            targetGroupArn: enums.alb.targetGroupArn,
        }],
    });
}

describe("aws.alb.Listener.disallowUnencryptedTraffic", function() {
    const policy = policies.aws.alb.Listener.disallowUnencryptedTraffic;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-alb-listener-disallow-unencrypted-traffic");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["alb"],
            severity: "critical",
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
        args.props.port = 80;
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should now allow unencrypted (HTTP) traffic." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.protocol = "HTTP";
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should now allow unencrypted (HTTP) traffic." });
    });
});

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
        args.props.sslPolicy = undefined;
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should use secure/modern TLS encryption with forward secrecy." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-TLS-1-2-2017-01";
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should use secure/modern TLS encryption with forward secrecy." });
    });

    it("#4", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-FS-1-1-2019-08";
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should use secure/modern TLS encryption with forward secrecy." });
    });

    it("#5", async function() {
        const args = getResourceValidationArgs();
        args.props.sslPolicy = "ELBSecurityPolicy-FS-1-1-2019-08";
        await assertHasResourceViolation(policy, args, { message: "ALB Load Balancers should use secure/modern TLS encryption with forward secrecy." });
    });
});
