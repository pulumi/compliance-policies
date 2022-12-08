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

import * as awsNative from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyRegistrations } from "../../utils";

/**
 * Checks that any launch template do not have public IP addresses.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-instance-addressing.html
 */
export const disallowPublicIP: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-ec2-launch-template-disallow-public-ips",
        description: "Checks that EC2 Launch Templates do not have public IP addresses.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.ec2.LaunchTemplate, (lt, args, reportViolation) => {
            lt.networkInterfaces?.forEach((iface) => {
                if (!iface.associatePublicIpAddress) {
                    reportViolation("EC2 Launch templates should not have public IP addresses.");
                }
            });
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
export const disallowUnencryptedBlockDevice: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-ec2-launch-template-disallow-unencrypted-volume",
        description: "Checks that EC2 Launch Templates do not have unencrypted volumes.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.ec2.LaunchTemplate, (lt, args, reportViolation) => {
            lt.blockDeviceMappings?.forEach((device) => {
                if (!device.ebs?.encrypted) {
                    reportViolation("EC2 Launch Templates should not have an unencypted block device.");
                }
            });
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "high",
    topics: ["encryption", "storage"],
});
