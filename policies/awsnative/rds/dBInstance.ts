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

import * as awsnative from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "../../utils";

/**
 * Checks that RDS DB Instances backup retention policy is enabled.
 *
 * @severity Medium
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const enableBackupRetention: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbinstance-enable-backup-retention",
        description: "Checks that RDS DB Instances backup retention policy is enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBInstance, (instance, args, reportViolation) => {
            if (!instance.backupRetentionPeriod) {
                reportViolation("RDS DB Instances backup retention should be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that RDS DB Instances backup retention policy is adequate.
 *
 * @severity Medium
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const configureBackupRetention: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbinstance-configure-backup-retention",
        description: "Checks that RDS DB Instances backup retention policy is adequate.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBInstance, (instance, args, reportViolation) => {
            /**
             * 3 (three) days should be the minimum in order to have full weekend coverage.
             */
            if (instance.backupRetentionPeriod && instance.backupRetentionPeriod < 3) {
                reportViolation("RDS DB Instances backup retention period should be greater than 3 days.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that RDS DB Instances have performance insights enabled.
 *
 * @severity Low
 * @link https://aws.amazon.com/rds/performance-insights/
 */
export const enablePerformanceInsights: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbinstance-enable-performance-insights",
        description: "Checks that RDS DB Instances have performance insights enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBInstance, (dbInstance, args, reportViolation) => {
            if (!dbInstance.enablePerformanceInsights) {
                reportViolation("RDS DB Instances should have performance insights enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["logging", "performance"],
});

/**
 * Checks that RDS DB Instances performance insights is encrypted.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const disallowUnencryptedPerformanceInsights: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbinstance-disallow-unencrypted-performance-insights",
        description: "Checks that RDS DB Instances performance insights is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBInstance, (dbInstance, args, reportViolation) => {
            if (dbInstance.enablePerformanceInsights && !dbInstance.performanceInsightsKMSKeyId) {
                reportViolation("RDS DB Instances should have performance insights encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that RDS DB Instances public access is not enabled.
 *
 * @severity Critical
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.Connect.html
 */
export const disallowPublicAccess: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbinstance-disallow-public-access",
        description: "Checks that RDS DB Instances public access is not enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBInstance, (dbInstance, args, reportViolation) => {
            if (dbInstance.publiclyAccessible) {
                reportViolation("RDS DB Instances public access should not be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "critical",
    topics: ["network"],
});

/**
 * Checks that RDS DB Instance storage is encrypted.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const disallowUnencryptedStorage: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbinstance-storage-disallow-unencrypted-storage",
        description: "Checks that RDS DB Instance storage is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBInstance, (instance, args, reportViolation) => {
            if (!instance.storageEncrypted) {
                reportViolation("RDS DB Instances storage should be encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that RDS DB Instance storage uses a customer-manager KMS key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbinstance-configure-customer-managed-key",
        description: "Checks that RDS DB Instance storage uses a customer-manager KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBInstance, (instance, args, reportViolation) => {
            if (instance.storageEncrypted && !instance.kmsKeyId) {
                reportViolation("RDS DB Instances storage should be encrypted using a customer-managed key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["encryption", "storage"],
});
