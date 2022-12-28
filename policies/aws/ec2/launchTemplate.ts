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
import { policiesManagement, valToBoolean } from "../../utils";

/**
 * Checks that any launch template do not have public IP addresses.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-instance-addressing.html
 */
export const disallowPublicIP: ResourceValidationPolicy = policiesManagement.registerPolicy({
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
 * Checks that any launch templates do not have unencrypted root volumes.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const disallowUnencryptedBlockDevice: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-launchtemplate-disallow-unencrypted-volume",
        description: "Checks that EC2 Launch Templates do not have unencrypted volumes.",
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
 * @severity **Low**
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
