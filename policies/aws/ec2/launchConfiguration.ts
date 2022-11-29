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
import { policyRegistrations } from "../../utils";

/**
 * Checks that any launch configuration do not have public IP addresses.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-instance-addressing.html
 */
export const noPublicIp: ResourceValidationPolicy = {
    name: "aws-ec2-launch-configuration-disallow-public-ips",
    description: "Checks that any launch configuration do not have public IP addresses.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.LaunchConfiguration, (lc, args, reportViolation) => {
        if (!lc.associatePublicIpAddress) {
            reportViolation("Launch configurations should not have a public IP address.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: noPublicIp,
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["network"],
});

/**
 * Checks that any launch configuration do not have unencrypted root volumes.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html
 */
export const noUnencryptedRootBlockDevice: ResourceValidationPolicy = {
    name: "aws-ec2-launch-configuration-disallow-unencrypted-root-volume",
    description: "Checks that any launch configuration do not have unencrypted root volumes.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.LaunchConfiguration, (lc, args, reportViolation) => {
        if (!lc.rootBlockDevice?.encrypted) {
            reportViolation("The root block device for this launch configuration is not encrypted.");
        }
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: noUnencryptedRootBlockDevice,
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["encryption", "storage"],
});

/**
 * Checks that any launch configuration do not have unencrypted volumes.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html
 */
export const noUnencryptedBlockDevice: ResourceValidationPolicy = {
    name: "aws-ec2-launch-configuration-disallow-unencrypted-volumes",
    description: "Checks that any launch configuration do not have unencrypted volumes.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.LaunchConfiguration, (lc, args, reportViolation) => {
        lc.ebsBlockDevices?.forEach((device) => {
            if (!device.encrypted) {
                reportViolation("A block device for this launch configuration is not encrypted.");
            }
        });
    }),
};

policyRegistrations.registerPolicy({
    resourceValidationPolicy: noUnencryptedBlockDevice,
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["encryption", "storage"],
});
