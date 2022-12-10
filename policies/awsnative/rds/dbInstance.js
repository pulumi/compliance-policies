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
exports.configureCustomerManagedKey = exports.disallowUnencryptedStorage = exports.disallowPublicAccess = exports.disallowUnencryptedPerformanceInsights = exports.enablePerformanceInsights = exports.configureBackupRetention = exports.enableBackupRetention = void 0;
var awsnative = require("@pulumi/aws-native");
var policy_1 = require("@pulumi/policy");
var utils_1 = require("../../utils");
/**
 * Checks that backup retention policy is adequate.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
exports.enableBackupRetention = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-instance-enable-retention",
        description: "Checks that RDS Instances backup retention policy is enabled.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBInstance, function (instance, args, reportViolation) {
            if (!instance.backupRetentionPeriod) {
                reportViolation("RDS Instance backup retention should be enabled.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"]
});
/**
 * Checks that RDS Instances backup retention policy is adequate.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
exports.configureBackupRetention = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-instance-configure-backup-retention",
        description: "Checks that RDS Instances backup retention policy is adequate.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBInstance, function (instance, args, reportViolation) {
            /**
             * 3 (three) days should be the minimum in order to have full weekend coverage.
             */
            if (instance.backupRetentionPeriod && instance.backupRetentionPeriod < 3) {
                reportViolation("RDS Instances backup retention period is lower than 3 days.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"]
});
/**
 * Checks that RDS Cluster Instances have performance insights enabled.
 *
 * @severity **Low**
 * @link https://aws.amazon.com/rds/performance-insights/
 */
exports.enablePerformanceInsights = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-cluster-instance-enable-performance-insights",
        description: "Checks that RDS Cluster Instances have performance insights enabled.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBInstance, function (dbInstance, args, reportViolation) {
            if (!dbInstance.enablePerformanceInsights) {
                reportViolation("RDS Cluster Instances should have performance insights enabled.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["logging", "performance"]
});
/**
 * Checks that performance insights in RDS Cluster is encrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
exports.disallowUnencryptedPerformanceInsights = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-cluster-instance-disallow-unencrypted-performance-insights",
        description: "Checks that RDS Cluster Instances performance insights is encrypted.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBInstance, function (dbInstance, args, reportViolation) {
            if (dbInstance.enablePerformanceInsights && dbInstance.performanceInsightsKMSKeyId === undefined) {
                reportViolation("RDS Cluster Instances should have performance insights encrypted.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"]
});
/**
 * Checks that RDS Cluster Instances public access is not enabled.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.Connect.html
 */
exports.disallowPublicAccess = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-cluster-instance-disallow-public-access",
        description: "Checks that RDS Cluster Instances public access is not enabled.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBInstance, function (dbInstance, args, reportViolation) {
            if (!dbInstance.publiclyAccessible) {
                reportViolation("RDS Cluster Instances public access should not be enabled.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "critical",
    topics: ["network"]
});
/**
 * Checks that RDS storage is encrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
exports.disallowUnencryptedStorage = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-rds-instance-storage-disallow-unencrypted-storage",
        description: "Checks that RDS instance storage is encrypted.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBInstance, function (instance, args, reportViolation) {
            if (!instance.storageEncrypted) {
                reportViolation("RDS Instance storage should be encrypted.");
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
        name: "aws-native-rds-instance-storage-encryption-with-customer-managed-key",
        description: "Checks that RDS Instance storage uses a customer-manager KMS key.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.rds.DBInstance, function (instance, args, reportViolation) {
            if (instance.storageEncrypted && instance.kmsKeyId === undefined) {
                reportViolation("RDS Instance storage should be encrypted using a customer-managed key.");
            }
        })
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["encryption", "storage"]
});
