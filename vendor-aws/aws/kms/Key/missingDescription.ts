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

import { Key } from "@pulumi/aws/kms";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/policy-manager";

/**
 * Checks that KMS Keys have a description.
 *
 * @severity low
 * @frameworks none
 * @topics documentation
 * @link https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html
 */
export const missingDescription: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-kms-key-missing-description",
        description: "Checks that KMS Keys have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Key, (key, args, reportViolation) => {
            if (!key.description) {
                reportViolation("KMS Keys should have a description.");
            } else {
                if (key.description.length < 6) {
                    reportViolation("KMS Keys should have a meaningful description.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["kms"],
    severity: "low",
    topics: ["documentation"],
});
