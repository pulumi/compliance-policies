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

import { FileSystem } from "@pulumi/aws-native/efs";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that EFS File systems do not bypass the File System policy lockout safety check.
 *
 * @severity critical
 * @frameworks none
 * @topics encryption
 * @link https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-efs-filesystem.html#cfn-efs-filesystem-bypasspolicylockoutsafetycheck
 */
export const disallowBypassPolicyLockoutSafetyCheck: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-efs-filesystem-disallow-bypass-policy-lockout-safety-check",
        description: "Checks that EFS File systems do not bypass the File System policy lockout safety check.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(FileSystem, (fileSystem, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (fileSystem.bypassPolicyLockoutSafetyCheck) {
                reportViolation("EFS File Systems should not bypass the file system policy lockout safety check.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["efs"],
    severity: "critical",
    topics: ["encryption"],
});
