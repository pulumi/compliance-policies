import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

/**
 * @description Checks that backup retention policy is adequate.
 */
export const clusterBackupRetention: ResourceValidationPolicy = {
    name: "aws-rds-instance-disallow-low-backup-retention-period",
    description: "Checks that backup retention policy is adequate.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Cluster, (cluster, args, reportViolation) => {
        if (!cluster.backupRetentionPeriod ?? 0 > 2) {
            reportViolation("RDS Cluster backup retention period is lower than 2 days.");
        }
    }),
};

/**
 * @description Checks that RDS storage is encrypted.
 */
export const clusterStorageEncrypted: ResourceValidationPolicy = {
    name: "aws-rds-instance-storage-encryption-enabled",
    description: "Checks that RDS storage is encrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Cluster, (cluster, args, reportViolation) => {
        if (!cluster.storageEncrypted) {
            reportViolation("RDS Cluster storage should be encrypted.");
        }
    }),
};

/**
 * @description Checks that storage is encrypted with a customer managed key.
 */
export const clusterStorageCustomerManagedKey: ResourceValidationPolicy = {
    name: "aws-rds-instance-storage-encryption-with-customer-managed-key",
    description: "Checks that storage is encrypted with a customer managed key.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Cluster, (cluster, args, reportViolation) => {
        if (cluster.storageEncrypted && cluster.kmsKeyId === undefined) {
            reportViolation("RDS Cluster storage should be encrypted with a customer managed key.");
        }
    }),
};