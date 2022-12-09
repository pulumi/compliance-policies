"use strict";
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
exports.__esModule = true;
exports.configureCustomerManagedKey = exports.disallowUnencryptedStorage = exports.configureBackupRetention = exports.enableBackupRetention = void 0;
var awsnative = require("@pulumi/aws-native");
var policy_1 = require("@pulumi/policy");
var utils_1 = require("../../utils");
/**
 * Checks that RDS Clusters backup retention policy is enabled.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
exports.enableBackupRetention = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-cluster-enable-backup-retention",
        description: "Checks that RDS Clusters backup retention policy is enabled.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBCluster, function (cluster, args, reportViolation) {
            if (!cluster.backupRetentionPeriod) {
                reportViolation("RDS Clusters backup retention should be enabled.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"]
});
/**
 * Checks that RDS Cluster backup retention policy is configured.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
exports.configureBackupRetention = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-cluster-configure-backup-retention",
        description: "Checks that RDS Cluster backup retention policy is configured.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBCluster, function (cluster, args, reportViolation) {
            /**
             * 3 (three) days should be the minimum in order to have full weekend coverage.
             */
            if (cluster.backupRetentionPeriod && cluster.backupRetentionPeriod < 3) {
                reportViolation("RDS Cluster backup retention period is lower than 3 days.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"]
});
/**
 * Checks that RDS storage is encrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
exports.disallowUnencryptedStorage = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-cluster-storage-disallow-unencrypted-storage",
        description: "Checks that RDS Clusters storage is encrypted.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBCluster, function (cluster, args, reportViolation) {
            if (!cluster.storageEncrypted) {
                reportViolation("RDS Cluster storage should be encrypted.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"]
});
/**
 * Checks that storage is encrypted with a customer managed key.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
exports.configureCustomerManagedKey = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-cluster-storage-encryption-with-customer-managed-key",
        description: "Checks that RDS Clusters storage uses a customer-manager KMS key.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBCluster, function (cluster, args, reportViolation) {
            if (cluster.storageEncrypted && cluster.kmsKeyId === undefined) {
                reportViolation("RDS Cluster storage should be encrypted using a customer-managed key.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["encryption", "storage"]
});
