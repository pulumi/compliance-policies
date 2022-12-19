import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";
import * as policies from "@bobcatt/pulumi-policies";

new PolicyPack("policy-pack-acme-corp-finops", {
    policies: [
        ...policies.policyRegistrations.filterPolicies({
            vendors:["aws"],
            frameworks: ["pcidss"],
        }),
        ...policies.policyRegistrations.filterPolicies({
            vendors:["kubernetes"],
            severities: ["critical"],
        }),
    ],
});
