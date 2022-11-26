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
 * Checks that any launch template do not have public IP addresses.
 */
export const launchTemplateNoPublicIp: ResourceValidationPolicy = {
    name: "aws-ec2-launch-template-disallow-public-ips",
    description: "Checks that any launch template do not have public IP addresses.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.LaunchTemplate, (lt, args, reportViolation) => {
        lt.networkInterfaces?.forEach((iface) => {
            if (!iface.associatePublicIpAddress) {
                reportViolation("Launch templates should not have a public IP address.");
            }
        });
    }),
};

/**
 * Checks that any launch templates do not have unencrypted root volumes.
 */
export const launchTemplateNoUnencryptedBlockDevice: ResourceValidationPolicy = {
    name: "aws-ec2-launch-template-unencrypted-volume",
    description: "Checks that any launch templates do not have unencrypted root volumes.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.LaunchTemplate, (lt, args, reportViolation) => {
        lt.blockDeviceMappings?.forEach((device) => {
            if (!device.ebs?.encrypted) {
                reportViolation("A block device for this launch template is not encrypted.");
            }
        });
    }),
};
