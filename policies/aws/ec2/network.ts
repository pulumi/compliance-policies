import {
  ResourceValidationPolicy,
  validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

export const awsEc2LaunchConfigurationNoPublicIp: ResourceValidationPolicy = {
  name: "disallow-public-ips-on-launch-config",
  description: "Checks that any launch configuration do not have public IP addresses.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(aws.ec2.LaunchConfiguration, (lc, args, reportViolation) => {
    if (!lc.associatePublicIpAddress) {
      reportViolation("Launch configurations should not have a public IP address.");
    }
  }),
};

export const awsEc2LaunchTemplateNoPublicIp: ResourceValidationPolicy = {
  name: "disallow-public-ips-on-launch-template",
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

export const awsEc2InstanceNoPublicIp: ResourceValidationPolicy = {
  name: "disallow-public-ips-on-instance",
  description: "Checks that any instance do not have public IP addresses.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(aws.ec2.Instance, (instance, args, reportViolation) => {
    if (!instance.associatePublicIpAddress) {
      reportViolation("Instances should not have a public IP address.");
    }
  }),
}
