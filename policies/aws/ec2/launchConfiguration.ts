
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

/**
 * @description Checks that any launch configuration do not have public IP addresses.
 */
export const launchConfigurationNoPublicIp: ResourceValidationPolicy = {
    name: "disallow-public-ips-on-launch-config",
    description: "Checks that any launch configuration do not have public IP addresses.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.LaunchConfiguration, (lc, args, reportViolation) => {
        if (!lc.associatePublicIpAddress) {
            reportViolation("Launch configurations should not have a public IP address.");
        }
    }),
};

/**
 * @description Checks that any launch configuration do not have unencrypted root volumes.
 */
 export const launchConfigurationNoUnencryptedRootBlockDevice: ResourceValidationPolicy = {
    name: "disallow-unencrypted-root-volume-on-launch-config",
    description: "Checks that any launch configuration do not have unencrypted root volumes.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.LaunchConfiguration, (lc, args, reportViolation) => {
        if (!lc.rootBlockDevice?.encrypted) {
            reportViolation("The root block device for this launch configuration is not encrypted.");
        }
    }),
};

/**
 * @description Checks that any launch configuration do not have unencrypted volumes.
 */
 export const launchConfigurationNoUnencryptedBlockDevice: ResourceValidationPolicy = {
    name: "disallow-unencrypted-volumes-on-launch-config",
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
