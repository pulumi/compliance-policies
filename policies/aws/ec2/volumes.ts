import {
  ResourceValidationPolicy,
  validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

const launchConfigRootBlockDevice: ResourceValidationPolicy = {
  name: "disallow-unencrypted-root-volume-on-launch-config",
  description:
    "Checks that any launch configuration do not have unencrypted root volumes.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(
    aws.ec2.LaunchConfiguration,
    (lc, args, reportViolation) => {
      if (!lc.rootBlockDevice?.encrypted) {
        reportViolation(
          "The root block device for this launch configuration is not encrypted."
        );
      }
    }
  ),
};

const launchConfigBlockDevices: ResourceValidationPolicy = {
  name: "disallow-unencrypted-volumes-on-launch-config",
  description:
    "Checks that any launch configuration do not have unencrypted volumes.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(
    aws.ec2.LaunchConfiguration,
    (lc, args, reportViolation) => {
      lc.ebsBlockDevices?.forEach((device) => {
        if (!device.encrypted) {
          reportViolation(
            "A block device for this launch configuration is not encrypted."
          );
        }
      });
    }
  ),
};

const instanceRootBlockDevice: ResourceValidationPolicy = {
  name: "disallow-unencrypted-root-volume-on-instance",
  description:
    "Checks that any EC2 instance does not have unencrypted root volumes.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(
    aws.ec2.Instance,
    (i, args, reportViolation) => {
      if (!i.rootBlockDevice?.encrypted) {
        reportViolation(
          "The root block device for this instance is not encrypted."
        );
      }
    }
  ),
};

const instanceBlockDevices: ResourceValidationPolicy = {
  name: "disallow-unencrypted-volumes-on-launch-config",
  description: "Checks that any EC2 instances do not have unencrypted volumes.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(
    aws.ec2.Instance,
    (i, args, reportViolation) => {
      i.ebsBlockDevices?.forEach((device) => {
        if (!device.encrypted) {
          reportViolation("A block device for this instance is not encrypted.");
        }
      });
    }
  ),
};

const launchTemplateBlockDevices: ResourceValidationPolicy = {
  name: "disallow-unencrypted-volumes-on-launch-template",
  description:
    "Checks that any launch templates do not have unencrypted root volumes.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(
    aws.ec2.LaunchTemplate,
    (lt, args, reportViolation) => {
      lt.blockDeviceMappings?.forEach((device) => {
        if (!device.ebs?.encrypted) {
          reportViolation(
            "A block device for this launch template is not encrypted."
          );
        }
      });
    }
  ),
};

export default [
  launchConfigRootBlockDevice,
  launchConfigBlockDevices,
  instanceRootBlockDevice,
  instanceBlockDevices,
  launchTemplateBlockDevices,
];
