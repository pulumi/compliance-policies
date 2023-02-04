// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as awsnative from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that RDS DB Clusters backup retention policy is enabled.
 *
 * @severity Medium
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const enableBackupRetention: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbcluster-enable-backup-retention",
        description: "Checks that RDS DB Clusters backup retention policy is enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBCluster, (cluster, args, reportViolation) => {
            if (!cluster.backupRetentionPeriod) {
                reportViolation("RDS DB Clusters backup retention should be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that RDS DB Cluster backup retention policy is configured.
 *
 * @severity Medium
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const configureBackupRetention: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbcluster-configure-backup-retention",
        description: "Checks that RDS DB Cluster backup retention policy is configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBCluster, (cluster, args, reportViolation) => {
            /**
             * 3 (three) days should be the minimum in order to have full weekend coverage.
             */
            if (cluster.backupRetentionPeriod && cluster.backupRetentionPeriod < 3) {
                reportViolation("RDS DB Cluster backup retention period is lower than 3 days.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "medium",
    topics: ["backup", "resilience"],
});

/**
 * Checks that RDS DB Cluster storage is encrypted.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const disallowUnencryptedStorage: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbcluster-disallow-unencrypted-storage",
        description: "Checks that RDS DB Cluster storage is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBCluster, (cluster, args, reportViolation) => {
            if (!cluster.storageEncrypted) {
                reportViolation("RDS DB Cluster storage should be encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that RDS DB Cluster storage uses a customer-managed KMS key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbcluster-configure-customer-managed-key",
        description: "Checks that RDS DB Cluster storage uses a customer-managed KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBCluster, (cluster, args, reportViolation) => {
            if (cluster.storageEncrypted && !cluster.kmsKeyId) {
                reportViolation("RDS DB Cluster storage should be encrypted using a customer-managed key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["encryption", "storage"],
});

/**
 * Check that RDS DB Cluster doesn't use single availability zone.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/multi-az-db-clusters-concepts.html
 */
export const disallowSingleAvailabilityZone: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-rds-dbcluster-disallow-single-availability-zone",
        description: "Check that RDS DB Cluster doesn't use single availability zone.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.rds.DBCluster, (cluster, args, reportViolation) => {
            if (cluster.availabilityZones && cluster.availabilityZones.length < 2) {
                reportViolation("RDS DB Clusters should use more than one availability zone.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["availability"],
});
