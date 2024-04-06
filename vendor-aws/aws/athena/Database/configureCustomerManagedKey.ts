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

import { Database } from "@pulumi/aws/athena";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that Athena Databases storage uses a customer-managed-key.
 *
 * @severity low
 * @frameworks hitrust, iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/athena/latest/ug/encryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-database-configure-customer-managed-key",
        description: "Checks that Athena Databases storage uses a customer-managed-key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Database, (database, args, reportViolation) => {
            if (database.encryptionConfiguration && database.encryptionConfiguration.encryptionOption !== "SSE_KMS") {
                reportViolation("Athena Databases should be encrypted using a customer-managed key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "low",
    topics: ["encryption", "storage"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
