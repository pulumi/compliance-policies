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
    return createResourceValidationArgs(aws.ecr.Repository, {
        imageScanningConfiguration: {
            scanOnPush: true,
        },
        imageTagMutability: "IMMUTABLE",
        encryptionConfigurations: [{
            encryptionType: "KMS",
            kmsKey: enums.kms.keyArn,
        }],
    });
}

describe("aws.ecr.Repository.configureImageScan", function() {
    const policy = policies.aws.ecr.Repository.configureImageScan;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ecr-repository-configure-image-scan");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "high",
            topics: ["container", "vulnerability"],
            frameworks: ["soc2", "pcidss"],
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
        args.props.imageScanningConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "ECR Repositories should have image scanning configured." });
    });
});

describe("aws.ecr.Repository.enableImageScan", function() {
    const policy = policies.aws.ecr.Repository.enableImageScan;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ecr-repository-enable-image-scan");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "high",
            topics: ["container", "vulnerability"],
            frameworks: ["soc2", "pcidss"],
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
        args.props.imageScanningConfiguration.scanOnPush = false;
        await assertHasResourceViolation(policy, args, { message: "ECR Repositories should enable 'scan-on-push'." });
    });
});

describe("aws.ecr.Repository.disallowMutableImage", function() {
    const policy = policies.aws.ecr.Repository.disallowMutableImage;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ecr-repository-disallow-mutable-image");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "high",
            topics: ["container"],
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
        args.props.imageTagMutability = undefined;
        await assertHasResourceViolation(policy, args, { message: "ECR repositories should enable immutable images." });
    });
});

describe("aws.ecr.Repository.disallowUnencryptedRepository", function() {
    const policy = policies.aws.ecr.Repository.disallowUnencryptedRepository;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ecr-repository-disallow-unencrypted-repository");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "high",
            topics: ["container", "encryption", "storage"],
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
        args.props.encryptionConfigurations = undefined;
        await assertHasResourceViolation(policy, args, { message: "ECR repositories should be encrypted." });
    });
});

describe("aws.ecr.Repository.configureCustomerManagedKey", function() {
    const policy = policies.aws.ecr.Repository.configureCustomerManagedKey;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ecr-repository-configure-customer-managed-key");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecr"],
            severity: "low",
            topics: ["container", "encryption", "storage"],
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
        args.props.encryptionConfigurations[0].encryptionType = undefined;
        await assertHasResourceViolation(policy, args, { message: "ECR repositories should be encrypted using a customer-managed KMS key." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.encryptionConfigurations[0].kmsKey = "";
        await assertHasResourceViolation(policy, args, { message: "ECR repositories should be encrypted using a customer-managed KMS key." });
    });
});
