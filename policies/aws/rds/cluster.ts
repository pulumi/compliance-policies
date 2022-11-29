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
export const backupRetention: ResourceValidationPolicy = {
    name: "aws-rds-cluster-disallow-low-backup-retention-period",
    description: "Checks that backup retention policy is adequate.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Cluster, (cluster, args, reportViolation) => {
        if (!cluster.backupRetentionPeriod ?? 0 > 2) {
            reportViolation("RDS Cluster backup retention period is lower than 2 days.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: backupRetention,
    vendors: ["aws"],
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
export const storageEncrypted: ResourceValidationPolicy = {
    name: "aws-rds-cluster-storage-encryption-enabled",
    description: "Checks that RDS storage is encrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Cluster, (cluster, args, reportViolation) => {
        if (!cluster.storageEncrypted) {
            reportViolation("RDS Cluster storage should be encrypted.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: storageEncrypted,
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
export const storageCustomerManagedKey: ResourceValidationPolicy = {
    name: "aws-rds-cluster-storage-encryption-with-customer-managed-key",
    description: "Checks that storage is encrypted with a customer managed key.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.rds.Cluster, (cluster, args, reportViolation) => {
        if (cluster.storageEncrypted && cluster.kmsKeyId === undefined) {
            reportViolation("RDS Cluster storage should be encrypted with a customer managed key.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: storageCustomerManagedKey,
    vendors: ["aws"],
    services: ["rds"],
    severity: "low",
    topics: ["encryption", "storage"],
});