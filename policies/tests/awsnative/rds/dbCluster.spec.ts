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
import { kms, root } from "../enums";

function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.rds.DBCluster, {
        availabilityZones: [
            root.availabilityZone1,
            root.availabilityZone2,
        ],
        backupRetentionPeriod: 5,
        storageEncrypted: true,
        kmsKeyId: kms.keyArn
    });
}

describe("aws.rds.DBCluster.enableBackupRetention", () => {
    const policy = policies.awsnative.rds.DbCluster.enableBackupRetention;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbcluster-enable-backup-retention");
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
        await assertHasResourceViolation(policy, args, { message: "RDS DB Clusters backup retention should be enabled." });
    });
});

describe("awsnative.rds.Cluster.configureBackupRetention", () => {
    const policy = policies.awsnative.rds.DbCluster.configureBackupRetention;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbcluster-configure-backup-retention");
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
        await assertHasResourceViolation(policy, args, { message: "RDS DB Cluster backup retention period is lower than 3 days." });
    });
});

describe("awsnative.rds.Cluster.disallowUnencryptedStorage", () => {
    const policy = policies.awsnative.rds.DbCluster.disallowUnencryptedStorage;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbcluster-storage-disallow-unencrypted-storage");
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
        await assertHasResourceViolation(policy, args, { message: "RDS DB Cluster storage should be encrypted." });
    });
});

describe("awsnative.rds.Cluster.configureCustomerManagedKey", () => {
    const policy = policies.awsnative.rds.DbCluster.configureCustomerManagedKey;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbcluster-storage-encryption-with-customer-managed-key");
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
        await assertHasResourceViolation(policy, args, { message: "RDS DB Cluster storage should be encrypted using a customer-managed key." });
    });
});

describe("awsnative.rds.Cluster.disallowSingleAvailabilityZone", () => {
    const policy = policies.awsnative.rds.DbCluster.disallowSingleAvailabilityZone;

    it("name", async () => {
        assertResourcePolicyName(policy, "awsnative-rds-dbcluster-disallow-single-availability-zone");
    });

    it("registration", async () => {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async () => {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
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
        args.props.availabilityZones = [root.availabilityZone1];
        await assertHasResourceViolation(policy, args, { message: "RDS DB Clusters should use more than one availability zone." });
    });
});
