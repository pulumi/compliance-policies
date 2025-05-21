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

import { Snapshot } from "@pulumi/aws/ebs";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that EBS snapshots are encrypted.
 *
 * @severity high
 * @frameworks cis, hitrust, iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const requireEncryption: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ebs-snapshot-require-encryption",
        description: "Ensures that EBS snapshots are encrypted.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Snapshot, (snapshot, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (snapshot.encrypted === undefined || snapshot.encrypted === false) {
                reportViolation("EBS snapshots must be encrypted to protect sensitive data at rest.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ebs"],
    severity: "high",
    topics: ["encryption", "storage"],
    frameworks: ["cis", "pcidss", "hitrust", "iso27001"],
});
