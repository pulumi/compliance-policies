import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

/**
 * @description Checks that any instance do not have public IP addresses.
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
 * @description Checks that any EC2 instance does not have unencrypted root volumes.
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
 * @description Checks that any EC2 instances do not have unencrypted volumes.
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
