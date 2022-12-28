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
import { policiesManagement } from "../../utils";

/**
 * Checks that Secrets Manager Secrets have a description.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html
 */
export const missingDescription: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-secrets-manager-secret-missing-description",
        description: "Checks that Secrets Manager Secrets have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.secretsmanager.Secret, (secret, args, reportViolation) => {
            if (!secret.description) {
                reportViolation("Secrets Manager Secrets should have a description.");
            } else {
                if (secret.description.length < 6 ) {
                    reportViolation("Secrets Manager Secrets should have a meaningful description.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["secretsmanager"],
    severity: "low",
    topics: ["documentation"],
});

/**
 * Check that Secrets Manager Secrets use a customer-manager KMS key.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-secrets-manager-secret-configure-customer-managed-key",
        description: "Check that Secrets Manager Secrets use a customer-manager KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.secretsmanager.Secret, (secret, args, reportViolation) => {
            if (!secret.kmsKeyId) {
                reportViolation("Secrets Manager Secrets should be encrypted using a customer-managed KMS key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["secretsmanager"],
    severity: "low",
    topics: ["encryption"],
});
