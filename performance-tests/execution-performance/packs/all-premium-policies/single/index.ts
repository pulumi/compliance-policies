import { PolicyPack } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * 📝
 * To use Pulumi Premium Policies (beta),
 * please read the README.md file for more information.
 */
new PolicyPack("all-premium-policies-typescript-single", {
    policies:[
        policyManager.selectPolicyByName("azurenative-securityinsights-v20230701preview-fusionalertrule-disallow-preview-resource")!,
    ],
});

/**
 * Optional✔️: Display additional stats and helpful
 * information when the policy pack is evaluated.
 */
policyManager.displaySelectionStats({
    displayGeneralStats: true,
    displayModuleInformation: false,
    displaySelectedPolicyNames: false,
});
