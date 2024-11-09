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

import { FileSystem } from "@pulumi/aws/efs";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that EFS File Systems do not have an unencrypted file system.
 *
 * @severity high
 * @frameworks hitrust, iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/efs/latest/ug/encryption-at-rest.html
 */
export const disallowUnencryptedFileSystem: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-efs-filesystem-disallow-unencrypted-file-system",
        description: "Checks that EFS File Systems do not have an unencrypted file system.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(FileSystem, (fileSystem, args, reportViolation) => {
            if (! policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (!fileSystem.encrypted) {
                reportViolation("EFS File systems should not have an unencypted file system.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["efs"],
    severity: "high",
    topics: ["encryption", "storage"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
