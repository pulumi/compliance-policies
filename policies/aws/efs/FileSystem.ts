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
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that EFS File Systems do not have an unencrypted file system.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/efs/latest/ug/encryption-at-rest.html
 */
export const disallowUnencryptedFileSystem: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-efs-filesystem-disallow-unencrypted-file-system",
        description: "Checks that EFS File Systems do not have an unencrypted file system.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.efs.FileSystem, (fileSystem, args, reportViolation) => {
            if (!fileSystem.encrypted) {
                reportViolation("EFS File systems should not have an unencypted file system.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["efs"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Check that encrypted EFS File system uses a customer-managed KMS key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-efs-filesystem-configure-customer-managed-key",
        description: "Check that encrypted EFS File system uses a customer-managed KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.efs.FileSystem, (fileSystem, args, reportViolation) => {
            if (fileSystem.encrypted && !fileSystem.kmsKeyId) {
                reportViolation("An EFS File System should be encrypted using a customer-managed KMS key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["efs"],
    severity: "low",
    topics: ["encryption", "storage"],
});

/**
 * Check that EFS File system doesn't use single availability zone.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/efs/latest/ug/storage-classes.html
 */
export const disallowSingleAvailabilityZone: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-efs-filesystem-disallow-single-availability-zone",
        description: "Check that EFS File system doesn't use single availability zone.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.efs.FileSystem, (fileSystem, args, reportViolation) => {
            if (fileSystem.availabilityZoneName) {
                reportViolation("EFS File Systems should use more than one availability zone.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["efs"],
    severity: "high",
    topics: ["storage", "availability"],
});
