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
 * Checks that Athena Databases have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/athena/latest/ug/creating-databases.html
 */
export const missingDescription: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-database-missing-description",
        description: "Checks that Athena Databases have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.athena.Database, (database, args, reportViolation) => {
            if (!database.comment) {
                reportViolation("Athena Databases should have a description.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "low",
    topics: ["documentation"],
});

/**
 * Checks that Athena Databases storage is encrypted.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/athena/latest/ug/encryption.html
 */
export const disallowUnencryptedDatabase: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-database-disallow-unencrypted-database",
        description: "Checks that Athena Databases storage is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.athena.Database, (database, args, reportViolation) => {
            if (!database.encryptionConfiguration) {
                reportViolation("Athena Databases should be encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that Athena Databases storage uses a customer-managed-key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/athena/latest/ug/encryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-database-configure-customer-managed-key",
        description: "Checks that Athena Databases storage uses a customer-managed-key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.athena.Database, (database, args, reportViolation) => {
            if (database.encryptionConfiguration && database.encryptionConfiguration.encryptionOption !== "SSE_KMS") {
                reportViolation("Athena Databases should be encrypted using a customer-managed key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "low",
    topics: ["encryption", "storage"],
});

