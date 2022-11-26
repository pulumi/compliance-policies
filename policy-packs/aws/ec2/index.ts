import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";
import * as policies from "@bobcatt/pulumi-policies";

new PolicyPack("policy-pack-bb5ac361-dc16-4bfe-af4f-78b290241862", {
    policies: [
        policies.aws.ebs.volumeNoUnencryptedVolume,
        policies.aws.ebs.volumeWithCustomerManagedKey,
        policies.aws.ec2.securityGroupMissingDescription,
        policies.aws.ec2.securityGroupNoInboundHttpTraffic,
    ],
});
