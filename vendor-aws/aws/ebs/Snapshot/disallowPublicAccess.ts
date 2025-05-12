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
 * Checks that EBS snapshots are not publicly accessible.
 *
 * @severity high
 * @frameworks cis, pcidss
 * @topics security, storage
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-modifying-snapshot-permissions.html
 */
export const disallowPublicAccess: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ebs-snapshot-disallow-public-access",
        description: "Ensures that EBS snapshots are not publicly accessible.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Snapshot, (snapshot, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            // Check if createVolumePermissions contains the 'all' group
            if (snapshot.createVolumePermissions) {
                for (const permission of snapshot.createVolumePermissions) {
                    if (permission.group === "all") {
                        reportViolation(
                            "EBS snapshots should not be publicly accessible. Remove the 'all' group from createVolumePermissions."
                        );
                        break;
                    }
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["ebs"],
    severity: "high",
    topics: ["security", "storage"],
    frameworks: ["cis", "pcidss"],
});