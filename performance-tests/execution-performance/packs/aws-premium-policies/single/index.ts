import { PolicyPack } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * 📝
 * To use Pulumi Premium Policies (beta),
 * please read the README.md file for more information.
 */
new PolicyPack("aws-premium-policies-typescript-single", {
    policies:[
        policyManager.selectPolicyByName("aws-apigatewayv2-stage-enable-access-logging")!,
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
