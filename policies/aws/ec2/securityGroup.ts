import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

/**
 * @description Checks that all security groups have a description.
 */
export const securityGroupMissingDescription: ResourceValidationPolicy = {
    name: "add-desciption-to-security-group",
    description: "Checks that all security groups have a description.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (sg, args, reportViolation) => {
        if (!sg.description) {
            reportViolation("Security group must have a description.");
        }
    }),
};

/**
 * @desciption Check that any security group doesn't allow inbound HTTP traffic.
 */
export const securityGroupNoInboundHttpTraffic: ResourceValidationPolicy = {
    name: "disallow-inbound-http-traffic",
    description: "Check that any security group doesn't allow inbound HTTP traffic.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (sg, args, reportViolation) => {
        sg.ingress?.forEach((ingress) => {
            if (ingress.protocol.toLowerCase() == "tcp" && (ingress.fromPort == 80 || ingress.toPort == 80)) {
                reportViolation("A security group ingress rule allows inbound HTTP traffic.");
            }
            if (ingress.protocol.toLowerCase() == "tcp" && (ingress.fromPort < 80 && ingress.toPort > 80)) {
                reportViolation("A security group ingress rule allows inbound HTTP traffic.");
            }
        });
    }),
};