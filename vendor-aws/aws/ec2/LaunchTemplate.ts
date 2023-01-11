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

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement, valToBoolean } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that EC2 Launch Templates do not have public IP addresses.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-instance-addressing.html
 */
export const disallowPublicIp: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-launchtemplate-disallow-public-ip",
        description: "Checks that EC2 Launch Templates do not have public IP addresses.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.LaunchTemplate, (launchTemplate, args, reportViolation) => {
            if (launchTemplate.networkInterfaces) {
                launchTemplate.networkInterfaces.forEach((iface) => {
                    // see https://github.com/pulumi/pulumi-aws/issues/2257
                    if (valToBoolean(iface.associatePublicIpAddress)) {
                        reportViolation("EC2 Launch templates should not associate a public IP address to an interface.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["network"],
});

/**
 * Checks that EC2 Launch Templates do not have unencrypted block device.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const disallowUnencryptedBlockDevice: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-launchtemplate-disallow-unencrypted-block-device",
        description: "Checks that EC2 Launch Templates do not have unencrypted block device.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.LaunchTemplate, (lt, args, reportViolation) => {
            if (lt.blockDeviceMappings) {
                lt.blockDeviceMappings.forEach((blockDevice) => {
                    // see https://github.com/pulumi/pulumi-aws/issues/2257
                    if (blockDevice.ebs && !valToBoolean(blockDevice.ebs.encrypted)) {
                        reportViolation("EC2 Launch Templates should not have an unencypted block device.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Check that encrypted EBS volume uses a customer-managed KMS key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-launchtemplate-configure-customer-managed-key",
        description: "Check that encrypted EBS volume uses a customer-managed KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.LaunchTemplate, (lt, args, reportViolation) => {
            if (lt.blockDeviceMappings) {
                lt.blockDeviceMappings.forEach((blockDevice) => {
                    // see https://github.com/pulumi/pulumi-aws/issues/2257
                    if (blockDevice.ebs && (valToBoolean(blockDevice.ebs.encrypted) && !blockDevice.ebs.kmsKeyId)) {
                        reportViolation("EC2 Launch Templates should not have encrypted block device using a customer-managed KMS key.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "low",
    topics: ["encryption", "storage"],
});
