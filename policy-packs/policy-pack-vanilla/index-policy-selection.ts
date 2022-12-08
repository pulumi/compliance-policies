import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";
import * as policies from "@bobcatt/pulumi-policies";

new PolicyPack("policy-pack-aws-kubernetes", {
    policies: [
        ...policies.policyRegistrations.filterPolicies({
            vendors:["aws", "kubernetes"],
        })
    ],
});
