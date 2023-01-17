import { PolicyPack } from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

new PolicyPack("policy-pack-acme-corp-finops", {
    policies: [
        ...policiesManagement.filterPolicies({
            vendors:["aws"],
            frameworks: ["pcidss"],
        }),
        ...policiesManagement.filterPolicies({
            vendors:["kubernetes"],
            severities: ["critical"],
        }),
    ],
});
