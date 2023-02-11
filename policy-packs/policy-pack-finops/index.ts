import { PolicyPack } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

new PolicyPack("policy-pack-acme-corp-finops", {
    policies: [
        ...policyManager.selectPolicies({
            vendors:["aws", "azure"],
            frameworks: ["pcidss", "csi", "iso27001"],
        }),
        ...policyManager.selectPolicies({
            vendors:["kubernetes"],
            severities: ["critical", "high"],
        }),
    ],
});
