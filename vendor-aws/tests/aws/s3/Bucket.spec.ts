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
    return createResourceValidationArgs(aws.s3.Bucket, {
        acl: "private",
        replicationConfiguration: {
            role: enums.iam.roleArn,
            rules: [{
                destination: {
                    bucket: enums.s3.bucketId,
                },
                status: "Enabled",
            }],
        },
        serverSideEncryptionConfiguration: {
            rule: {
                applyServerSideEncryptionByDefault: {
                    sseAlgorithm: "aws:kms",
                    kmsMasterKeyId: enums.kms.keyArn,
                },
                bucketKeyEnabled: true,
            },
        },
    });
}

describe("aws.s3.Bucket.disallowPublicRead", function() {
    const policy = policies.aws.s3.Bucket.disallowPublicRead;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-s3-bucket-disallow-public-read");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "critical",
            topics: ["storage", "security"],
            frameworks: ["cis", "pcidss"],
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
        args.props.acl = "public-read";
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets ACLs should not be set to 'public-read', 'public-read-write' or 'authenticated-read'." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.acl = "authenticated-read";
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets ACLs should not be set to 'public-read', 'public-read-write' or 'authenticated-read'." });
    });
});

describe("aws.s3.Bucket.enableReplicationConfiguration", function() {
    const policy = policies.aws.s3.Bucket.enableReplicationConfiguration;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-s3-bucket-enable-replication-configuration");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "high",
            topics: ["availability"],
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
        args.props.replicationConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "S3 buckets should have cross-region replication enabled." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.replicationConfiguration.rules = [];
        await assertHasResourceViolation(policy, args, { message: "S3 buckets should have cross-region replication enabled." });
    });
});

describe("aws.s3.Bucket.configureReplicationConfiguration", function() {
    const policy = policies.aws.s3.Bucket.configureReplicationConfiguration;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-s3-bucket-configure-replication-configuration");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "high",
            topics: ["availability"],
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
        args.props.replicationConfiguration.rules[0].status = "Disabled";
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets replication rules should be configured." });
    });
});

describe("aws.s3.Bucket.enableServerSideEncryption", function() {
    const policy = policies.aws.s3.Bucket.enableServerSideEncryption;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-s3-bucket-enable-server-side-encryption");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "high",
            topics: ["encryption", "storage"],
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
        args.props.serverSideEncryptionConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets Server-Side Encryption (SSE) should be enabled." });
    });
});

describe("aws.s3.Bucket.configureServerSideEncryptionKms", function() {
    const policy = policies.aws.s3.Bucket.configureServerSideEncryptionKms;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-s3-bucket-configure-server-side-encryption-kms");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "high",
            topics: ["encryption", "storage"],
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
        args.props.serverSideEncryptionConfiguration.rule.applyServerSideEncryptionByDefault.sseAlgorithm = "AES256";
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets Server-Side Encryption (SSE) should use AWS KMS." });
    });
});

describe("aws.s3.Bucket.configureServerSideEncryptionCustomerManagedKey", function() {
    const policy = policies.aws.s3.Bucket.configureServerSideEncryptionCustomerManagedKey;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-s3-bucket-configure-server-side-encryption-customer-managed-key");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "low",
            topics: ["encryption", "storage"],
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
        args.props.serverSideEncryptionConfiguration.rule.applyServerSideEncryptionByDefault.kmsMasterKeyId = "";
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets Server-Side Encryption (SSE) should use a Customer-managed KMS key." });
    });
});

describe("aws.s3.Bucket.enableServerSideEncryptionBucketKey", function() {
    const policy = policies.aws.s3.Bucket.enableServerSideEncryptionBucketKey;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-s3-bucket-enable-server-side-encryption-bucket-key");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "medium",
            topics: ["encryption", "storage", "cost"],
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
        args.props.serverSideEncryptionConfiguration.rule.bucketKeyEnabled = undefined;
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets Server-Side Encryption (SSE) should use a Bucket key to reduce cost." });
    });
});
