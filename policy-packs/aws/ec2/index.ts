import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";
import * as policies from "@bobcatt/pulumi-policies";

new PolicyPack("policy-pack-bb5ac361-dc16-4bfe-af4f-78b290241862", {
    policies: [
        ...policies.policyRegistrations.filterPolicies({
            vendors:["aws", "kubernetes"],
        })
    ],
});
