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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that RDS Instances backup retention policy is enabled.
 *
 * @severity Medium
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const enableBackupRetention: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-enable-backup-retention",
        description: "Checks that RDS Instances backup retention policy is enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
            if (!instance.backupRetentionPeriod) {
                reportViolation("RDS Clusters backup retention should be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that backup retention policy is adequate.
 *
 * @severity Medium
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const configureBackupRetention: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-configure-backup-retention",
        description: "Checks that backup retention policy is adequate.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
            /**
             * 3 (three) days should be the minimum in order to have full weekend coverage.
             */
            if (instance.backupRetentionPeriod && instance.backupRetentionPeriod < 3) {
                reportViolation("RDS Instances backup retention period is lower than 3 days.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that no RDS Instances classic resources are created.
 *
 * @severity Critical
 * @link https://aws.amazon.com/blogs/aws/ec2-classic-is-retiring-heres-how-to-prepare/
 */
export const disallowClassicResource: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-disallow-classic-resource",
        description: "Checks that no RDS Instances classic resources are created.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
            if (instance.securityGroupNames && instance.securityGroupNames.length > 0) {
                reportViolation("RDS Instances should not be created with EC2-Classic security groups.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "critical",
    topics: ["stability", "availability"],
});

/**
 * Checks that RDS instances have performance insights enabled.
 *
 * @severity Low
 * @link https://aws.amazon.com/rds/performance-insights/
 */
export const enablePerformanceInsights: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-enable-performance-insights",
        description: "Checks that RDS instances have performance insights enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
            if (!instance.performanceInsightsEnabled) {
                reportViolation("RDS Instances should have performance insights enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["logging", "performance"],
});

/**
 * Checks that RDS Instance performance insights is encrypted.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.htm
 */
export const disallowUnencryptedPerformanceInsights: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-disallow-unencrypted-performance-insights",
        description: "Checks that RDS Instance performance insights is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
            if (instance.performanceInsightsEnabled && !instance.performanceInsightsKmsKeyId) {
                reportViolation("RDS Instances performance insights should be encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that RDS Instance public access is not enabled.
 *
 * @severity Critical
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.Connect.html
 */
export const disallowPublicAccess: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-disallow-public-access",
        description: "Checks that RDS Instance public access is not enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
            if (instance.publiclyAccessible === true) {
                reportViolation("RDS Instances public access should not be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "critical",
    topics: ["network"],
});

/**
 * Checks that RDS instance storage is encrypted.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const disallowUnencryptedStorage: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-disallow-unencrypted-storage",
        description: "Checks that RDS instance storage is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
            if (!instance.storageEncrypted) {
                reportViolation("RDS Instance storage should be encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that RDS Instance storage uses a customer-managed KMS key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-configure-customer-managed-key",
        description: "Checks that RDS Instance storage uses a customer-managed KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
            if (instance.storageEncrypted && !instance.kmsKeyId) {
                reportViolation("RDS Instance storage should be encrypted using a customer-managed key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["encryption", "storage"],
});
