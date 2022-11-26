// Copyright 2016-2022, Pulumi Corporation.
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

/**
 * Checks that any instance do not have public IP addresses.
 */
export const instanceNoPublicIp: ResourceValidationPolicy = {
    name: "aws-ec2-instance-disallow-public-ips",
    description: "Checks that any instance do not have public IP addresses.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.Instance, (instance, args, reportViolation) => {
        if (!instance.associatePublicIpAddress) {
            reportViolation("Instances should not have a public IP address.");
        }
    }),
};

/**
 * Checks that any EC2 instance does not have unencrypted root volumes.
 */
export const instanceNoUnencryptedRootBlockDevice: ResourceValidationPolicy = {
    name: "aws-ec2-instance-disallow-unencrypted-root-volume",
    description: "Checks that any EC2 instance does not have unencrypted root volumes.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.Instance, (i, args, reportViolation) => {
        if (!i.rootBlockDevice?.encrypted) {
            reportViolation("The root block device for this instance is not encrypted.");
        }
    }),
};

/**
 * Checks that any EC2 instances do not have unencrypted volumes.
 */
export const instanceNoUnencryptedBlockDevice: ResourceValidationPolicy = {
    name: "aws-ec2-instance-disallow-unencrypted-volumes",
    description: "Checks that any EC2 instances do not have unencrypted volumes.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.Instance, (i, args, reportViolation) => {
        i.ebsBlockDevices?.forEach((device) => {
            if (!device.encrypted) {
                reportViolation("A block device for this instance is not encrypted.");
            }
        });
    }),
};
