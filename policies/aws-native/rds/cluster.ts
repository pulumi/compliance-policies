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

import * as aws_native from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyRegistrations } from "../../utils";

/**
 * Checks that RDS Clusters backup retention policy is enabled.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const enableBackupRetention: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-rds-cluster-enable-backup-retention",
        description: "Checks that RDS Clusters backup retention policy is enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.rds.Cluster, (cluster, args, reportViolation) => {
            if (!cluster.backupRetentionPeriod) {
                reportViolation("RDS Clusters backup retention should be enabled.");
            }
        }),
    },
    vendors: ["aws_native"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that RDS Cluster backup retention policy is configured.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const configureBackupRetention: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-rds-cluster-configure-backup-retention",
        description: "Checks that RDS Cluster backup retention policy is configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.rds.Cluster, (cluster, args, reportViolation) => {
            /**
             * 3 (three) days should be the minimum in order to have full weekend coverage.
             */
            if (cluster.backupRetentionPeriod && cluster.backupRetentionPeriod < 3) {
                reportViolation("RDS Cluster backup retention period is lower than 3 days.");
            }
        }),
    },
    vendors: ["aws_native"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that RDS storage is encrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const disallowUnencryptedStorage: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-rds-cluster-storage-disallow-unencrypted-storage",
        description: "Checks that RDS Clusters storage is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.rds.Cluster, (cluster, args, reportViolation) => {
            if (!cluster.storageEncrypted) {
                reportViolation("RDS Cluster storage should be encrypted.");
            }
        }),
    },
    vendors: ["aws_native"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that storage is encrypted with a customer managed key.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-rds-cluster-storage-encryption-with-customer-managed-key",
        description: "Checks that RDS Clusters storage uses a customer-manager KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.rds.Cluster, (cluster, args, reportViolation) => {
            if (cluster.storageEncrypted && cluster.kmsKeyId === undefined) {
                reportViolation("RDS Cluster storage should be encrypted using a customer-managed key.");
            }
        }),
    },
    vendors: ["aws_native"],
    services: ["rds"],
    severity: "low",
    topics: ["encryption", "storage"],
});
