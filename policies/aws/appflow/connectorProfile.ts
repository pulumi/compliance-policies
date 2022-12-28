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
 * Check that AppFlow ConnectorProfile uses a customer-managed KMS key.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/appflow/latest/userguide/data-protection.html#encryption-transit
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-appflow-connectorprofile-configure-customer-managed-key",
        description: "Check that AppFlow ConnectorProfile uses a customer-managed KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.appflow.ConnectorProfile, (connectorProfile, args, reportViolation) => {
            if (!connectorProfile.kmsArn) {
                reportViolation("AppFlow Connector Profiles should be encrypted using a customer-managed KMS key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["appflow"],
    severity: "low",
    topics: ["encryption", "storage"],
});
