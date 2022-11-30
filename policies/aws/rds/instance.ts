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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyRegistrations } from "../../utils";

/**
 * Checks that backup retention policy is adequate.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const enableBackupRetention: ResourceValidationPolicy = {
    name: "aws-rds-instance-enable-retention",
    description: "Checks that RDS Instances backup retention policy is enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (!instance.backupRetentionPeriod) {
            reportViolation("RDS Clusters backup retention should be enabled.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: enableBackupRetention,
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that backup retention policy is adequate.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const configureBackupRetention: ResourceValidationPolicy = {
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
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: configureBackupRetention,
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that no RDS classic resources are created.
 *
 * @severity **Critical**
 * @link https://aws.amazon.com/blogs/aws/ec2-classic-is-retiring-heres-how-to-prepare/
 */
export const disallowClassicResources: ResourceValidationPolicy = {
    name: "aws-rds-instance-disallow-classic-resources",
    description: "Checks that no RDS Instances classic resources are created.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (!instance.securityGroupNames) {
            reportViolation("RDS Instances should not be created with EC2-Classic security groups.");
        } else {
            if (instance.securityGroupNames.length === 0) {
                reportViolation("RDS Instances should not be created with EC2-Classic security groups.");
            }
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: disallowClassicResources,
    vendors: ["aws"],
    services: ["rds"],
    severity: "critical",
    topics: ["stability", "availability"],
});

/**
 * Checks that RDS instances have performance insights enabled.
 *
 * @severity **Low**
 * @link https://aws.amazon.com/rds/performance-insights/
 */
export const enablePerformanceInsights: ResourceValidationPolicy = {
    name: "aws-rds-instance-enable-performance-insights",
    description: "Checks that RDS instances have performance insights enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (!instance.performanceInsightsEnabled) {
            reportViolation("RDS Instances should have performance insights enabled.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: enablePerformanceInsights,
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["logging", "performance"],
});

/**
 * Checks that performance insights in RDS is encrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.htm
 */
export const disallowUnencryptedPerformanceInsights: ResourceValidationPolicy = {
    name: "aws-rds-instance-disallow-unencrypted-performance-insights",
    description: "Checks that RDS Instance performance insights is encrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (instance.performanceInsightsEnabled && instance.performanceInsightsKmsKeyId === undefined) {
            reportViolation("RDS Instances performance insights should be encrypted.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: disallowUnencryptedPerformanceInsights,
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that public access is not enabled on RDS Instances.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.Connect.html
 */
export const disallowPublicAccess: ResourceValidationPolicy = {
    name: "aws-rds-instance-disallow-public-access",
    description: "Checks that RDS Instance public access is not enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (instance.publiclyAccessible === true) {
            reportViolation("RDS Instances public access should not be enabled.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: disallowPublicAccess,
    vendors: ["aws"],
    services: ["rds"],
    severity: "critical",
    topics: ["network"],
});

/**
 * Checks that RDS storage is encrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const disallowUnencryptedStorage: ResourceValidationPolicy = {
    name: "aws-rds-instance-storage-disallow-unencrypted-storage",
    description: "Checks that RDS instance storage is encrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (!instance.storageEncrypted) {
            reportViolation("RDS Instance storage should be encrypted.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: disallowUnencryptedStorage,
    vendors: ["aws"],
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
export const configureCustomerManagedKey: ResourceValidationPolicy = {
    name: "aws-rds-instance-storage-encryption-with-customer-managed-key",
    description: "Checks that RDS Instance storage uses a customer-manager KMS key.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (instance.storageEncrypted && instance.kmsKeyId === undefined) {
            reportViolation("RDS Instance storage should be encrypted using a customer-managed key.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: configureCustomerManagedKey,
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["encryption", "storage"],
});
