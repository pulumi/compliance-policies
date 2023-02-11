import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";

/**
 * 🔥 Don't use this method.
 */

import {
    validateResourceOfType,
} from "@pulumi/policy";

new PolicyPack("policy-pack-acme-corp-finops",  {
    policies: [
        {
            name: "aws-ec2-instance-disallow-public-ips",
            description: "Checks that EC2 instances do not have a public IP address.",
            enforcementLevel: "advisory",
            validateResource: validateResourceOfType(aws.ec2.Instance, (instance, args, reportViolation) => {
                if (instance.associatePublicIpAddress === undefined || instance.associatePublicIpAddress === true) {
                    reportViolation("EC2 Instances should not have a public IP address.");
                }
            }),
        },{
            name: "s3-no-public-read",
            description: "Prohibits setting the publicRead or publicReadWrite permission on AWS S3 buckets.",
            enforcementLevel: "advisory",
            validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
                if (bucket.acl === "public-read" || bucket.acl === "public-read-write") {
                    reportViolation(
                        "Checks that S3 Bucket ACLs don't allow 'public-read' or 'public-read-write' or 'authenticated-read'.\n" +
                        "S3 Buckets ACLs should not be set to 'public-read', 'public-read-write' or 'authenticated-read'.");
                }
            }),
        }
    ],
});
