// Copyright 2016-2022, Pulumi Corporation.
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
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { ec2, kms } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.rds.Instance, {
        instanceClass: aws.rds.InstanceType.M1_Large,
        backupRetentionPeriod: 5,
        vpcSecurityGroupIds: [ ec2.vpcSecurityGroupId ],
        performanceInsightsEnabled: true,
        performanceInsightsKmsKeyId: kms.keyArn,
        publiclyAccessible: false,
        storageEncrypted: true,
        kmsKeyId: kms.keyArn,
    });
}

describe("aws.aws.rds.Instance.enableBackupRetention", () => {
    const policy = policies.aws.rds.Instance.enableBackupRetention;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-instance-enable-backup-retention");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "medium",
            topics: ["backup", "resilience"],
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
        args.props.backupRetentionPeriod = undefined;
        await assertHasResourceViolation(policy, args, { message: "RDS Clusters backup retention should be enabled." });
    });
});

describe("aws.aws.rds.Instance.configureBackupRetention", () => {
    const policy = policies.aws.rds.Instance.configureBackupRetention;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-instance-configure-backup-retention");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "medium",
            topics: ["backup", "resilience"],
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
        args.props.backupRetentionPeriod = 2;
        await assertHasResourceViolation(policy, args, { message: "RDS Instances backup retention period is lower than 3 days." });
    });
});

describe("aws.aws.rds.Instance.disallowClassicResource", () => {
    const policy = policies.aws.rds.Instance.disallowClassicResource;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-instance-disallow-classic-resource");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "critical",
            topics: ["stability", "availability"],
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
        args.props.securityGroupNames = ["sg-abcdef01"];
        await assertHasResourceViolation(policy, args, { message: "RDS Instances should not be created with EC2-Classic security groups." });
    });
});

describe("aws.aws.rds.Instance.enablePerformanceInsights", () => {
    const policy = policies.aws.rds.Instance.enablePerformanceInsights;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-instance-enable-performance-insights");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "low",
            topics: ["logging", "performance"],
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
        args.props.performanceInsightsEnabled = undefined;
        await assertHasResourceViolation(policy, args, { message: "RDS Instances should have performance insights enabled." });
    });
});

describe("aws.aws.rds.Instance.disallowUnencryptedPerformanceInsights", () => {
    const policy = policies.aws.rds.Instance.disallowUnencryptedPerformanceInsights;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-instance-disallow-unencrypted-performance-insights");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
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
        args.props.performanceInsightsKmsKeyId = "";
        await assertHasResourceViolation(policy, args, { message: "RDS Instances performance insights should be encrypted." });
    });
});

describe("aws.aws.rds.Instance.disallowPublicAccess", () => {
    const policy = policies.aws.rds.Instance.disallowPublicAccess;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-instance-disallow-public-access");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "critical",
            topics: ["network"],
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
        args.props.publiclyAccessible = true;
        await assertHasResourceViolation(policy, args, { message: "RDS Instances public access should not be enabled." });
    });
});

describe("aws.aws.rds.Instance.disallowUnencryptedStorage", () => {
    const policy = policies.aws.rds.Instance.disallowUnencryptedStorage;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-instance-storage-disallow-unencrypted-storage");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
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
        args.props.storageEncrypted = false;
        await assertHasResourceViolation(policy, args, { message: "RDS Instance storage should be encrypted." });
    });
});

describe("aws.aws.rds.Instance.configureCustomerManagedKey", () => {
    const policy = policies.aws.rds.Instance.configureCustomerManagedKey;

    it("name", async () => {
        assertResourcePolicyName(policy, "aws-rds-instance-storage-encryption-with-customer-managed-key");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
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
        args.props.kmsKeyId = "";
        await assertHasResourceViolation(policy, args, { message: "RDS Instance storage should be encrypted using a customer-managed key." });
    });
});
