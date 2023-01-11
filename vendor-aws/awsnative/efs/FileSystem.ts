// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as awsnative from "@pulumi/aws-native";
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
        name: "awsnative-efs-filesystem-disallow-unencrypted-file-system",
        description: "Checks that EFS File Systems do not have an unencrypted file system.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.efs.FileSystem, (fileSystem, args, reportViolation) => {
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
        name: "awsnative-efs-filesystem-configure-customer-managed-key",
        description: "Check that encrypted EFS File system uses a customer-managed KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.efs.FileSystem, (fileSystem, args, reportViolation) => {
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
        name: "awsnative-efs-filesystem-disallow-single-availability-zone",
        description: "Check that EFS File system doesn't use single availability zone.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.efs.FileSystem, (fileSystem, args, reportViolation) => {
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

/**
 * Checks that EFS File systems do not bypass the File System policy lockout safety check.
 *
 * @severity Critical
 * @link https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-efs-filesystem.html#cfn-efs-filesystem-bypasspolicylockoutsafetycheck
 */
export const disallowBypassPolicyLockoutSafetyCheck: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-efs-filesystem-disallow-bypass-policy-lockout-safety-check",
        description: "Checks that EFS File systems do not bypass the File System policy lockout safety check.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.efs.FileSystem, (fileSystem, args, reportViolation) => {
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
