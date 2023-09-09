# Pulumi Premium Policies

Welcome to Pulumi Premium Policies, the latest addition to our Policy as Code offering. Designed exclusively for our early testers on the Business Critical plan, Premium Policies take your infrastructure management to the next level. With a comprehensive coverage of AWS, Azure, and Kubernetes, our premium policies provide an enhanced level of control and governance over your cloud resources. Currently available for JavaScript and TypeScript, with plans to expand to other languages in the near future, Pulumi Premium Policies empower you to enforce best practices, security standards, and compliance requirements seamlessly within your infrastructure-as-code workflows.

## Join our Beta Program

If you're eager to get hands-on experience with Pulumi Premium Policies and become part of our exclusive beta program, we invite you to send us a request via our contact page at <https://www.pulumi.com/contact/>. As a beta program participant, you'll have the opportunity to shape the future of our premium policies, providing valuable feedback and insights. Don't miss this chance to be among the first to leverage the power of Policy as Code with Pulumi Premium Policies.

## Basic configuration

Pulumi Premium Policies require minimum configuration. Before creating an empty Policy Pack, simply make sure you've set the `PULUMI_ACCESS_TOKEN` environment variable with a Pulumi access token linked to your Pulumi organization.

✅ The `PULUMI_ACCESS_TOKEN` is expected to be present in your local development environment, CI/CD and anywhere you deploy your Pulumi applications.

## Building a policy pack

### Policy selection

Pulumi Premium Policies come with a Policy Manager to help you quickly build policy packs by simply selecting policies of interest.

Policies are selected using any of the 5 metadata fields. See below for more information.

The example below show how to select policies for AWS that are related to the EC2 and S3 service, for which the policy severity is rated either medium, high or critical, and where the policies are related to encryption and the PCI-DSS framework.

```ts
import { PolicyPack } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

new PolicyPack("aws-premium-policies-typescript", {
    policies:[
        ...policyManager.selectPolicies({
            vendors: ["aws"],
            services: ["ec2", "s3"],
            severities: ["medium", "high", "critical"],
            topics: ["encryption"],
            frameworks: ["pcidss"],
        }, "mandatory" ),
    ],
});

policyManager.displaySelectionStats({
    displayGeneralStats: true,
    displayModuleInformation: true,
    displaySelectedPolicyNames: true,
});

```

✅ Policy selection doesn't require any `import` statement other than Policy Manager. Policy Manager automatically finds and load policy packages. Simply make sure your `package.json` contains the correct policy packages you wish to load.

To assist in policy selection visbility, Policy Manager has the ability to display selection statistics when calling `policyManager.displaySelectionStats()`. Each times your policies are evaluated as part of a stack preview or stack update, statistics will also be displayed and recorded in the Pulumi Cloud Service.

### Policy cherry-picking

Pulumi Premium Policies also allow you to create fine-tuned policy packs by individually selecting policies.

The policies are structures in the same way the provider resources are structured.

```ts
import { PolicyPack } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import * as awsPolicies from "@pulumi-premium-policies/aws-policies";

new PolicyPack("aws-premium-policies-typescript", {
    policies:[
        awsPolicies.aws.alb.LoadBalancer.enableAccessLogging,
        awsPolicies.aws.alb.LoadBalancer.configureAccessLogging,
        policyManager.setPolicyEnforcementLevel(awsPolicies.awsnative.ec2.Volume.disallowUnencryptedVolume, "mandatory"),
    ],
});

```

✅ To allow policy cherry-picking and unlike policy selection described above, you need to import the policy package in your policy pack.

## Publish a policy pack

Policy packs that use Pulumi Premium Policies aren't different from vanilla policy packs. Simply follow our document to publish and enforce a policy pack <https://www.pulumi.com/docs/using-pulumi/crossguard/get-started/#enforcing-a-policy-pack>.

When a policy pack is being installed, it will expect a `PULUMI_ACCESS_TOKEN` associated with your Pulumi organization.

## Useful information

### Policy selection criteria

Pulumi Premium Policies currently have up to 5 selection criteria available. Each selection criteria takes 1 or more values.

The selection criteria work as an `and` operator, while the values for each criteria work as an `or` operator.

Selection criteria

| Name         | Description                                                                                                                                      | Examples                                                            |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `vendors`    | The name of a Cloud vendor. Current supported vendors are `aws`, `azure` and `kubernetes`.                                                       | `["aws"]` or `["aws", "kubernetes"]` or `["aws", "azure"]`          |
| `services`   | An array of services names that are part of the selected vendor(s).                                                                              | `["ec2"]` or `["eks", "ecr"]` or `["s3", "athena"]`                 |
| `severities` | An array of severities. Valid values range from `low`, `medium`, `h` up to `critical`.                                                           | `["critical"]` or `["medium", "high"]`                              |
| `frameworks` | Compliance framework(s) associated to a policy. A policy may be related to more than one compliance framework.                                   | `["pcidss"]` or `["pcidss", "iso27001"]`                            |
| `topics`     | A list of topics, or area of interest, related to the policies to select. Some valid values are `network`, `encryption`, `logging`, `storage`... | `["network", "encryption"]` or `["storage"]` or `["documentation"]` |

### Policies and enforcement level

Pulumi Premium Policies come with a defaut enforcement level of `advisory`. This is done by design so newly published policy packs don't immediately impact your deployment.

Policy pack creators have the ability to set their desired enforcement level *before* and *after* publishing their policy packs.

Before publication, the enforcement level can be set when selecting your policies as part of `policyManager.selectPolicies()`. Alternatively, when cherry-picking policies you may wish to call `policyManager.setPolicyEnforcementLevel(resourcePolicy, enforcementLevel)`.

Once a policy pack has been publish in your Pulumi organization, you may configure the enforcement level of each individual policy directly from within your Policy group.

## Feedback and bug reports

Please give us feedback and report any bugs directly over your dedicated Slack channel or by opening a ticket at <https://support.pulumi.com>.
