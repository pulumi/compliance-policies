import {
  ResourceValidationPolicy,
  validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

const launchConfig: ResourceValidationPolicy = {
  name: "disallow-public-ips-on-launch-config",
  description:
    "Checks that any launch configuration do not have public IP addresses.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(
    aws.ec2.LaunchConfiguration,
    (lc, args, reportViolation) => {
      if (!lc.associatePublicIpAddress) {
        reportViolation(
          "Launch configurations should not have a public IP address."
        );
      }
    }
  ),
};

const launchTemplate: ResourceValidationPolicy = {
  name: "disallow-public-ips-on-launch-template",
  description:
    "Checks that any launch template do not have public IP addresses.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(
    aws.ec2.LaunchTemplate,
    (lt, args, reportViolation) => {
      lt.networkInterfaces?.forEach((iface) => {
        if (!iface.associatePublicIpAddress) {
          reportViolation(
            "Launch templates should not have a public IP address."
          );
        }
      });
    }
  ),
};

const instance: ResourceValidationPolicy = {
  name: "disallow-public-ips-on-instance",
  description: "Checks that any instance do not have public IP addresses.",
  enforcementLevel: "advisory",
  validateResource: validateResourceOfType(
    aws.ec2.Instance,
    (instance, args, reportViolation) => {
      if (!instance.associatePublicIpAddress) {
        reportViolation("Instances should not have a public IP address.");
      }
    }
  )
}

export default [launchConfig, launchTemplate, instance];
