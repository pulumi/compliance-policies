import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

/**
 * @description Checks that any launch template do not have public IP addresses.
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
 * @description Checks that any launch templates do not have unencrypted root volumes.
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
