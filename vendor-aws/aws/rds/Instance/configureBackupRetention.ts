// Copyright 2016-2024, Pulumi Corporation.
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

import { Instance } from "@pulumi/aws/rds";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/policy-manager";

/**
 * Checks that backup retention policy is adequate.
 *
 * @severity medium
 * @frameworks iso27001, pcidss
 * @topics backup, resilience
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention
 */
export const configureBackupRetention: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-configure-backup-retention",
        description: "Checks that backup retention policy is adequate.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Instance, (instance, args, reportViolation) => {
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
    frameworks: ["pcidss", "iso27001"],
});
