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

import * as awsnative from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "../../utils";

/**
 * Checks that EBS volumes are encrypted.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const disallowUnencryptedVolume: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-ec2-volume-disallow-unencrypted-volume",
        description: "Checks that EBS volumes are encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.ec2.Volume, (v, args, reportViolation) => {
            if (!v.encrypted) {
                reportViolation("An EBS volume is currently not encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ebs"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Check that encrypted EBS volume uses a customer-managed KMS key.
 *
 * @severity **Low**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-ec2-volume-configure-customer-managed-key",
        description: "Check that encrypted EBS volumes use a customer-manager KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.ec2.Volume, (v, args, reportViolation) => {
            if (v.encrypted && !v.kmsKeyId) {
                reportViolation("An EBS volume should be encrypted using a customer-managed KMS key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ebs"],
    severity: "low",
    topics: ["encryption", "storage"],
});
