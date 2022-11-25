import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";

import * as awsEc2SecurityGroupPolicies from "../../policies/aws/ec2/securityGroup";

new PolicyPack("aws-ec2-securitygroup", {
    policies: [
        awsEc2SecurityGroupPolicies.awsEc2SecurityGroupMissingDescription,
        awsEc2SecurityGroupPolicies.awsEc2SecurityGroupNoInboundHttpTraffic
    ],
});
