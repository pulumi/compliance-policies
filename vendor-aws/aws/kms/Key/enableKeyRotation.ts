// Copyright 2016-2025, Pulumi Corporation.
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
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that KMS Keys have key rotation enabled.
 *
 * @severity medium
 * @frameworks hitrust, iso27001, pcidss
 * @topics encryption
 * @link https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html
 */
export const enableKeyRotation: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-kms-key-enable-key-rotation",
        description: "Checks that KMS Keys have key rotation enabled.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Key, (key, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (!key.enableKeyRotation) {
                reportViolation("KMS Keys should have key rotation enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["kms"],
    severity: "medium",
    topics: ["encryption"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
