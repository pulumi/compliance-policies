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

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.kms.Key, {
        bypassPolicyLockoutSafetyCheck: false,
        description: "This is a description for this KMS key.",
        enableKeyRotation: true,
    });
}

describe("aws.kms.Key.enableKeyRotation", function() {
    const policy = policies.aws.kms.Key.enableKeyRotation;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-kms-key-enable-key-rotation");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["kms"],
            severity: "medium",
            topics: ["encryption"],
        });
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
        args.props.enableKeyRotation = undefined;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have key rotation enabled." });
    });
});

describe("aws.kms.Key.missingDescription", function() {
    const policy = policies.aws.kms.Key.missingDescription;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-kms-key-missing-description");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["kms"],
            severity: "low",
            topics: ["documentation"],
        });
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
        args.props.description = undefined;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have a description." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.description = "key";
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should have a meaningful description." });
    });
});

describe("aws.kms.Key.disallowBypassPolicyLockoutSafetyCheck", function() {
    const policy = policies.aws.kms.Key.disallowBypassPolicyLockoutSafetyCheck;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-kms-key-disallow-bypass-policy-lockout-safety-check");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["kms"],
            severity: "critical",
            topics: ["encryption"],
        });
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
        args.props.bypassPolicyLockoutSafetyCheck = true;
        await assertHasResourceViolation(policy, args, { message: "KMS Keys should not bypass the key policy lockout safety check." });
    });
});
