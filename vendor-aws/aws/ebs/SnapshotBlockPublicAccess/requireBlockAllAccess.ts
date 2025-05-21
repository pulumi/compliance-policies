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

import { SnapshotBlockPublicAccess } from "@pulumi/aws/ebs";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that EBS snapshots block all public access.
 *
 * @severity high
 * @frameworks cis, pcidss
 * @topics security, storage
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-modifying-snapshot-permissions.html
 */
export const requireBlockAllAccess: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ebs-snapshotblockpublicaccess-require-block-all-access",
        description: "Ensures that EBS snapshots are configured to block all public access.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(SnapshotBlockPublicAccess, (snapshotBlockPublicAccess, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (snapshotBlockPublicAccess.state !== "block-all-sharing") {
                reportViolation(
                    "EBS SnapshotBlockPublicAccess should be configured with 'state' set to 'block-all-sharing' to prevent any public sharing of snapshots."
                );
            }
        }),
    },
    vendors: ["aws"],
    services: ["ebs"],
    severity: "high",
    topics: ["security", "storage"],
    frameworks: ["cis", "pcidss"],
});
