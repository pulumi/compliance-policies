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
import * as awsnative from "@pulumi/aws-native";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { ec2, kms, rds } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.rds.DBInstance, {
        dBInstanceClass: rds.dBInstanceClass,
        backupRetentionPeriod: 5,
        vPCSecurityGroups: [ ec2.vpcSecurityGroupId ],
        enablePerformanceInsights: true,
        performanceInsightsKMSKeyId: kms.keyArn,
        publiclyAccessible: false,
        storageEncrypted: true,
        kmsKeyId: kms.keyArn,
    });
}

describe("awsnative.rds.DbInstance.enableBackupRetention", () => {
    const policy = policies.awsnative.rds.DbInstance.enableBackupRetention;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-enable-backup-retention");
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
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances backup retention should be enabled." });
    });
});

describe("awsnative.rds.DbInstance.configureBackupRetention", () => {
    const policy = policies.awsnative.rds.DbInstance.configureBackupRetention;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-configure-backup-retention");
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
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances backup retention period should be greater than 3 days." });
    });
});

describe("awsnative.rds.DbInstance.enablePerformanceInsights", () => {
    const policy = policies.awsnative.rds.DbInstance.enablePerformanceInsights;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-enable-performance-insights");
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
        args.props.enablePerformanceInsights = undefined;
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances should have performance insights enabled." });
    });
});

describe("awsnative.rds.DbInstance.disallowUnencryptedPerformanceInsights", () => {
    const policy = policies.awsnative.rds.DbInstance.disallowUnencryptedPerformanceInsights;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-disallow-unencrypted-performance-insights");
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
        args.props.performanceInsightsKMSKeyId = "";
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances should have performance insights encrypted." });
    });
});

describe("awsnative.rds.DbInstance.disallowPublicAccess", () => {
    const policy = policies.awsnative.rds.DbInstance.disallowPublicAccess;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-disallow-public-access");
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
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances public access should not be enabled." });
    });
});

describe("awsnative.rds.DbInstance.disallowUnencryptedStorage", () => {
    const policy = policies.awsnative.rds.DbInstance.disallowUnencryptedStorage;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-storage-disallow-unencrypted-storage");
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
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances storage should be encrypted." });
    });
});

describe("awsnative.rds.DbInstance.configureCustomerManagedKey", () => {
    const policy = policies.awsnative.rds.DbInstance.configureCustomerManagedKey;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbinstance-configure-customer-managed-key");
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
        await assertHasResourceViolation(policy, args, { message: "RDS DB Instances storage should be encrypted using a customer-managed key." });
    });
});
