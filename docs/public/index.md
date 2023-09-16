# Pulumi Premium Policies

Welcome to Pulumi Premium Policies, the latest addition to our Policy as Code offering. Designed
exclusively for our Business Critical customers, Premium Policies take your infrastructure
management to the next level.

With a comprehensive coverage of AWS, Azure, Google, and Kubernetes, our Premium Policies provide
an enhanced level of control and governance over your cloud resources. Currently available for
JavaScript and TypeScript, with plans to expand to other languages in the future,Pulumi Premium
Policies empower you to enforce best practices, security standards, cost control and compliance
requirements seamlessly within your infrastructure-as-code workflows.

If you're not yet familiar with Policy as Code, read more about it [here](https://www.pulumi.com/docs/using-pulumi/crossguard/).

## Authoring a Policy Pack with Pulumi Premium Policies

Authoring a Policy Pack with Pulumi Premium Policies is very easy. Pulumi Premium Policies come with
a [Policy Manager](http://FIXME) to help you quickly build policy packs by simply selecting policies
of interest or changing the enforcement level of your choosen policies.

There are 2 main ways to author a new Policy Pack as shown below. The methods described below can be
used side-by-side with each other if you desire so.

### Policy selection

Pulumi Premium Policies have been enriched with additional metadata allowing authors to quickly select
and use policies based on areas of focus.

Policies are selected using any of the 5 metadata fields.

* `vendor` holds the vendor's name to which the policy belong to. For example `aws` is for Amazon
  Web Services.
* `services` holds the service name to which the policy belong to. For example `s3` is for Amazon
  Web Services Simple Storage Service (S3).
* `severities` for the policy severity. Valid values are `low`, `medium`, `high` and `critical`.
* `topics` a set of keyworks pertaining to the policy. For example `encryption`, `cost`, `backup`...
* `frameworks` holds information about the policy and the compliance frameworks it belongs to. For
  example `pcidss` for the PCI-DSS framework

The example below shows how to select policies for AWS that are related to the EC2 and S3 service and
for which the policy severity is rated either medium, high or critical, and where the policies are
related to encryption and to the PCI-DSS framework.

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

✅ Policy selection doesn't require any `import` statement other than Policy Manager. Policy Manager
automatically finds and load policy packages as plugins. Simply make sure your `package.json`
contains the correct policy packages you wish to load and use.

To assist in policy selection visbility and traceability, Policy Manager has the ability to display
selectionstatistics when calling `policyManager.displaySelectionStats()`. Each times your policies
are evaluated as part of a stack preview or stack update, statistics will also be displayed and
recorded in the Pulumi Cloud Service as part of your Pulumi app output.

### Policy cherry-picking

When using Pulumi Premium Policies it's also possible to create finely-tuned Policy Packs by manually
selecting individual policies.

To allow Premium Policy cherry-picking, you need to `import` the policy package in your Policy Pack code.

It's recommended to use `policyManager.setPoliciesEnforcementLevel()` or `policyManager.setPolicyEnforcementLevel()`
when cherry-picking Premium Policies so your Policy Pack statistics are accurate. Not doing so may
lead to duplicated policy selection as well as inacurrate Policy Pack statistics.

```ts
import { PolicyPack } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import * as awsPolicies from "@pulumi-premium-policies/aws-policies";

new PolicyPack("aws-premium-policies-typescript", {
    policies:[
        ...policyManager.setPoliciesEnforcementLevel([
            awsPolicies.aws.alb.LoadBalancer.configureAccessLogging,
            awsPolicies.awsnative.ec2.Volume.disallowUnencryptedVolume
        ], "mandatory"),
        ...policyManager.setPoliciesEnforcementLevel([
            awsPolicies.aws.alb.LoadBalancer.enableAccessLogging,
        ], "advisory"),
    ],
});

policyManager.displaySelectionStats({
    displayGeneralStats: true,
    displayModuleInformation: true,
    displaySelectedPolicyNames: true,
});
```

✅ Pulumi Premium Policies are structured the same way the provider services and resources are structured,
making them easy to navigate. Consider using a modern IDE to leverage code completion, linting and embeded
code documentation.

### Mixed authoring

Premium Policy selection and cherry picking methods can be combined together.

```ts
import { PolicyPack } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import * as awsPolicies from "@pulumi-premium-policies/aws-policies";
import * as k8sPolicies from "@pulumi-premium-policies/kubernetes-policies";

new PolicyPack("aws-premium-policies-typescript", {
    policies:[
        ...policyManager.selectPolicies({
            vendors: ["aws"],
            services: ["ec2", "s3"],
            severities: ["medium", "high", "critical"],
        }, "mandatory" ),
        ...policyManager.selectPolicies({
            vendors: ["kubernetes"],
            severities: ["high", "critical"],
        }, "mandatory"),
        ...policyManager.setPoliciesEnforcementLevel([
            awsPolicies.aws.alb.LoadBalancer.configureAccessLogging,
            awsPolicies.aws.alb.LoadBalancer.enableAccessLogging,
        ], "advisory"),
    ],
});
policyManager.displaySelectionStats({
    displayGeneralStats: true,
    displayModuleInformation: true,
    displaySelectedPolicyNames: true,
});
```

### Policy Pack Statistics

To assist in policy selection visbility and traceability, Policy Manager has the ability to display
selection statistics when calling `policyManager.displaySelectionStats()`. Each times your policies
are evaluated as part of a stack preview or stack update, statistics will also be displayed and
recorded in the Pulumi Cloud Service as part of your Pulumi app output.

This feature allows your organization to track the policies evaluated during a stack update or a preview,
as well as the total number of policies selected, and the Pulumi Premium Policies packages versions
used in your Policy Pack.

To display statictics about your Policy Packs and the Premium Policies in use, simply add the following
statement at the bottom of your Policy Pack.

See [Policy Manager](http://FIXME) documentation for more details.

```ts
policyManager.displaySelectionStats({
    displayGeneralStats: true,
    displayModuleInformation: true,
    displaySelectedPolicyNames: true,
});
```

### Additional Premium Policy Packages

Pulumi Premium Policies are published in per-vendor packages. Each Premium Policy package contains
policies for both Azure and Azure Native providers as those providers are compatible with one another.

To manually add a new Premium Policy package, you need a [Pulumi Access Token](https://www.pulumi.com/docs/pulumi-cloud/access-management/access-tokens/).
In your development environment, we recommend using a Personal Access Token.

Exposing your Pulumi Access Token is **only** required when you add a new Premium Policy package **manually**.
When your Policy Pack is deployed using the Pulumi CLI during a stack update or a stack preview, this
operation is not required.

You may add additional Premium Policies packages with the following the commands:

```bash
export PULUMI_ACCESS_TOKEN="pul-xxxxxxxxxxxxxxxxxxx"
npm install "@pulumi-premium-policies/kubernetes-policies" --save
```

For a complete list of available Premium Policy packages, please refrence to our reference
[documentation](http://FIXME).

If NPM returns a `HTTP 403 - Access Denied`, then either the provided Pulumi Access Token is invalid,
or the Token doesn't belong to a Pulumi Organization that has subscribed to the Business Critical Plan.

Contact our [sales team](https://www.pulumi.com/pricing/) to learn more about our Business Critical plan.

## Policy Pack Execution

Policy Packs using Pulumi Premium Policies bear no differences to vaniall Policy Packs. It's possible
to run Policy packs locally or have them enforced across your Pulumi Organization.

Please refer to our [documentation](https://www.pulumi.com/docs/using-pulumi/crossguard/configuration/)
for more details.

## Performance

Pulumi Premium Policies have been designed from the ground up to be efficient from the start. However
like any software, we recommend Policy Pack Authors to be mindful how they implement their Policy Packs.

Pulumi recommends to avoid installing policy packages for vendor you don't use. Doing so will reduce
memory usage and will make the execution of your Pulumi app faster.

Pulumi recommends loading Premium Policies for only services and resources you intend to use. This will
result in faster Pulumi app execution.

Consider using multiple policy packs (one for each vendor) as this will result in faster installation
but at the expense of a slightly slower execution and larger memory footprint.

Pulumi also recommends upgrading your Pulumi Premium Policy packages regularly. Many Policies are added
and updated on a regular basis giving you better Infrastructure as Code guardrails.
