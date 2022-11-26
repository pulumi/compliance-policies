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

/**
 * @description Checks that backup retention policy is adequate.
 */
export const instanceBackupRetention: ResourceValidationPolicy = {
    name: "aws-rds-instance-disallow-low-backup-retention-period",
    description: "Checks that backup retention policy is adequate.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (!instance.backupRetentionPeriod ?? 0 > 2) {
        reportViolation("RDS Instance backup retention period is lower than 2 days.");
        }
    }),
};

export const instanceClassicResources: ResourceValidationPolicy = {
    name: "aws-rds-instance-disallow-classic-resources",
    description: "Checks that no RDS classic resources are created.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (!instance.securityGroupNames?.length ?? 0 > 0) {
            reportViolation("RDS Instances should not be created with EC2-Classic security groups.");
        }
    }),
};

/**
 * @description Checks that RDS has performance insights enabled.
 */
export const instancePerformanceInsights: ResourceValidationPolicy = {
    name: "aws-rds-instance-performance-insights-enabled",
    description: "Checks that RDS has performance insights enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (!instance.performanceInsightsEnabled) {
            reportViolation("RDS Instances should have performance insights enabled.");
        }
    }),
};

/**
 * @description Checks that performance insights in RDS is encrypted.
 */
export const instancePerformanceInsightsEncrypted: ResourceValidationPolicy = {
    name: "aws-rds-instance-performance-insights-encrypted",
    description: "Checks that performance insights in RDS is encrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (instance.performanceInsightsEnabled && instance.performanceInsightsKmsKeyId === undefined) {
            reportViolation("RDS Instances should have performance insights encrypted.");
        }
    }),
};

/**
 * @description Checks that public access is not enabled on RDS Instances.
 */
export const instancePublicAccess: ResourceValidationPolicy = {
    name: "aws-rds-instance-disallow-public-access",
    description: "Checks that public access is not enabled on RDS Instances.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (!instance.publiclyAccessible) {
            reportViolation("RDS Instances should not be created with public access enabled.");
        }
    }),
};

/**
 * @description Checks that RDS storage is encrypted.
 */
export const instanceStorageEncrypted: ResourceValidationPolicy = {
    name: "aws-rds-instance-storage-encryption-enabled",
    description: "Checks that RDS storage is encrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (!instance.storageEncrypted) {
            reportViolation("RDS Instance storage should be encrypted.");
        }
    }),
};

/**
 * @description Checks that storage is encrypted with a customer managed key.
 */
export const instanceStorageCustomerManagedKey: ResourceValidationPolicy = {
    name: "aws-rds-instance-storage-encryption-with-customer-managed-key",
    description: "Checks that storage is encrypted with a customer managed key.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Instance, (instance, args, reportViolation) => {
        if (instance.storageEncrypted && instance.kmsKeyId === undefined) {
            reportViolation("RDS Instance storage should be encrypted with a customer managed key.");
        }
    }),
};
