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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription } from "../../utils";
import * as awsnative from "@pulumi/aws-native";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { iam, kms, s3 } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.s3.Bucket, {
        accessControl: awsnative.s3.BucketAccessControl.Private,
        replicationConfiguration: {
            role: iam.roleArn,
            rules: [{
                destination: {
                    bucket: s3.bucketId
                },
                status: awsnative.s3.BucketReplicationRuleStatus.Enabled,
            }]
        },
        bucketEncryption: {
            serverSideEncryptionConfiguration: [{
                bucketKeyEnabled: true,
                serverSideEncryptionByDefault: {
                    sSEAlgorithm: awsnative.s3.BucketServerSideEncryptionByDefaultSSEAlgorithm.Awskms,
                    kMSMasterKeyID: kms.keyArn,
                }
            }],
        }
    });
}

describe("awsnative.s3.Bucket.disallowPublicRead", () => {
    const policy = policies.awsnative.s3.Bucket.disallowPublicRead;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-s3-bucket-disallow-public-read");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "critical",
            topics: ["storage", "security"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.accessControl = awsnative.s3.BucketAccessControl.PublicRead;
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets ACLs should not be set to 'PublicRead', 'PublicReadWrite' or 'AuthenticatedRead'." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.accessControl = awsnative.s3.BucketAccessControl.AuthenticatedRead;
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets ACLs should not be set to 'PublicRead', 'PublicReadWrite' or 'AuthenticatedRead'." });
    });
});

describe("awsnative.s3.Bucket.enableReplicationConfiguration", () => {
    const policy = policies.awsnative.s3.Bucket.enableReplicationConfiguration;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-s3-bucket-enable-replication-configuration");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "high",
            topics: ["availability"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.replicationConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "S3 buckets should have cross-region replication enabled." });
    });

    it("#3", async () => {
        const args = getResourceValidationArgs();
        args.props.replicationConfiguration.rules = [];
        await assertHasResourceViolation(policy, args, { message: "S3 buckets should have cross-region replication enabled." });
    });
});

describe("awsnative.s3.Bucket.configureReplicationConfiguration", () => {
    const policy = policies.awsnative.s3.Bucket.configureReplicationConfiguration;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-s3-bucket-configure-replication-configuration");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "high",
            topics: ["availability"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.replicationConfiguration.rules[0].status = awsnative.s3.BucketReplicationRuleStatus.Disabled;
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets replication should be configured and enabled." });
    });
});

describe("awsnative.s3.Bucket.enableServerSideEncryption", () => {
    const policy = policies.awsnative.s3.Bucket.enableServerSideEncryption;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-s3-bucket-enable-server-side-encryption");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.bucketEncryption.serverSideEncryptionConfiguration = undefined;
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets Server-Side Encryption (SSE) should be enabled." });
    });
});

describe("awsnative.s3.Bucket.configureServerSideEncryptionKMS", () => {
    const policy = policies.awsnative.s3.Bucket.configureServerSideEncryptionKMS;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-s3-bucket-configure-server-side-encryption-kms");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "high",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.bucketEncryption.serverSideEncryptionConfiguration[0].serverSideEncryptionByDefault.sSEAlgorithm = awsnative.s3.BucketServerSideEncryptionByDefaultSSEAlgorithm.Aes256;
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets Server-Side Encryption (SSE) should use AWS KMS." });
    });
});

describe("awsnative.s3.Bucket.configureServerSideEncryptionCustomerManagedKey", () => {
    const policy = policies.awsnative.s3.Bucket.configureServerSideEncryptionCustomerManagedKey;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-s3-bucket-configure-server-configure-side-encryption-customer-managed-key");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "low",
            topics: ["encryption", "storage"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.bucketEncryption.serverSideEncryptionConfiguration[0].serverSideEncryptionByDefault.kMSMasterKeyID = "";
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets Server-Side Encryption (SSE) should use a Customer-managed KMS key." });
    });
});

describe("awsnative.s3.Bucket.enableServerSideEncryptionBucketKey", () => {
    const policy = policies.awsnative.s3.Bucket.enableServerSideEncryptionBucketKey;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-s3-bucket-enable-server-side-encryption-bucket-key");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "medium",
            topics: ["encryption", "storage", "cost"],
        });
    });

    it("enforcementLevel", async () => {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async () => {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async () => {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async () => {
        const args = getResourceValidationArgs();
        args.props.bucketEncryption.serverSideEncryptionConfiguration[0].bucketKeyEnabled = undefined;
        await assertHasResourceViolation(policy, args, { message: "S3 Buckets Server-Side Encryption (SSE) should use a Bucket key to reduce cost." });
    });
});
