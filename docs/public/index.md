# Pulumi Premium Policies

Welcome to Pulumi Premium Policies, the latest addition to our Policy as Code offering. Designed
exclusively for our Business Critical and select customers, Premium Policies take your infrastructure
management to the next level.

With a comprehensive coverage of AWS, Azure, Google, and Kubernetes, our Premium Policies provide
an enhanced level of control and governance over your cloud resources. Although Premium Policies
are currently available in JavaScript and TypeScript, they can be used with Pulumi stacks written
in any language. Pulumi Premium Policies empower you to enforce best practices, security standards,
cost control and compliance requirements seamlessly within your infrastructure-as-code workflows.

If you're not yet familiar with Policy as Code, read more about it [here](https://www.pulumi.com/docs/using-pulumi/crossguard/).

## Installation

Pulumi Premium Policies are already integrated with the Pulumi CLI. When you run [`pulumi policy new`](https://www.pulumi.com/docs/cli/commands/pulumi_policy_new/),
you are presented with a series of Premium Policies flavored Policy Packs such as `aws-premium-policies-typescript`,
`aws-iso27001-premium-policies-typescript` and `azure-iso27001-premium-policies-typescript` along with
many others.

Upon selecting one of those pre-built Policy Packs, the Pulumi CLI takes care of downloading and installing
the required dependencies in your local environment.

Alternatively, a steps-by-step wizard is available in the Pulumi Cloud Console with all the required
instructions.

### Manual installation

While the Pulumi CLI offers great convenience around the initial installation of the Premium Policies
packages, some users may prefer to do a manual installation instead.

Pulumi Premium Policies packages are located in a private NPM artifact repository. To gain access, users
need to configure their environment accordingly.

First, the Policy Pack needs to contain a `.npmrc` file with the content shown below. This file instructs
NPM where packages are located and how authentication needs to be performed on the registry.

```
@pulumi-premium-policies:registry=https://premium-policies.beta.pulumi-ce.team/
//premium-policies.beta.pulumi-ce.team/:_authToken=${PULUMI_ACCESS_TOKEN}
//premium-policies.beta.pulumi-ce.team/:always-auth=true
```

FIXME The URL above is only valid until Pulumi Premium Policies are released on 10/10/2023.

Second, the file above references the environment variable `PULUMI_ACCESS_TOKEN`. You should then set
your local environment with a proper value using a Personal Access Token, an Organization Token or
a Team Token.

```sh
export PULUMI_ACCESS_TOKEN="pul-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

⛔ Do not save the Pulumi Access Token directly into the `.npmrc`. This is a security risk to your organization.

The last step consists of installing the Premium Policies packages. Note that `@pulumi-premium-policies/policy-manager`
is always required and should be explicitly present in your `package.json`.

Supported packages are:

* `@pulumi-premium-policies/policy-manager` (Required) Policy Manager is used to manage Premium Policies.
* `@pulumi-premium-policies/aws-policies` Set of Premium Policies for Amazon Web Services, for both
  AWS Native and AWS Classic providers.
* `@pulumi-premium-policies/azure-policies` Set of Premium Policies for Microsoft Azure, for both Azure
  Native and Azure Classic providers.
* `@pulumi-premium-policies/google-policies` Set of Premium Policies for Google Cloud Platform, for
  both Google Native and GCP providers.
* `@pulumi-premium-policies/kubernetes-policies` Set of Premium Policies for Kubernetes.

### Policy packages upgrade

Pulumi regularly publishes new policies, enhancements and bug fixes to its Premium Policies packages
and framework.

You should regularly update to the latest versions as you already do with the Pulumi providers and other
SDKs.

To check for newer versions, simply run `npm outdated`. If some packages are outdated, they will be listed
as shown below.

```
Package                                  Current  Wanted  Latest  Location                                              Depended by
@pulumi-premium-policies/aws-policies      0.0.8   0.0.8  0.0.15  node_modules/@pulumi-premium-policies/aws-policies    premium-policies
@pulumi-premium-policies/policy-manager    0.0.3   0.0.3   0.0.6  node_modules/@pulumi-premium-policies/policy-manager  premium-policies
```

Then install the latest versions

```sh
npm install @pulumi-premium-policies/aws-policies@0.0.15 @pulumi-premium-policies/policy-manager@0.0.6 --save
```

⚠️ Always upgrade Policy Manager and other Policy Packages at the same time to ensure Premium Policies
are correctly registered with the Policy Manager.

Once your Policy Pack contains the latest versions, test it locally and finally publish a new version
of your Policy Pack into your Pulumi organization.

## Authoring a Policy Pack with Pulumi Premium Policies

Authoring a Policy Pack with Pulumi Premium Policies is very easy. Pulumi Premium Policies come with
a [Policy Manager](http://FIXME) to help you quickly build policy packs by simply selecting policies
of interest or changing the enforcement level of your chosen policies.

There are 2 main ways to author a new Policy Pack as shown below. The methods described below can be
used side-by-side with each other if you desire so.

### Policy selection

Pulumi Premium Policies have been enriched with additional metadata allowing authors to quickly select
and use policies based on areas of focus.

Policies have 5 metadata fields:

The `vendor` field holds the vendor's name to which the policy belongs to. For example `aws` is for
Amazon Web Services. If a vendor has more than one Pulumi provider (ie, AWS Classic and AWS Native),
then policies are grouped under the same vendor name. This is done so organizations have a complete
control over resource creation regardless of the Pulumi provider used.

The `services` field holds the service name to which the policy belongs to. For example `s3` is for
Amazon Web Services Simple Storage Service (S3), or `containerserice` is for Azure Container Service.

The `severity` field describes the policy severity across 4 severity levels, from `low`, `medium`,
`high` to `critical` . As some policies address more sensitive issues, this field highlights the
security risks associated.

The `topics` field contains a set of keywords pertaining to the policy. For example `encryption`,
`cost`, `backup`, `availability` and so on. It allows organizations to select policies based on area
of focus.

Finally, `frameworks` holds information about the policy and the compliance frameworks it belongs to.
For example `pcidss` for the PCI-DSS framework. It enables organizations to quickly select policies
based on a compliance framework they wish to adhere.

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
automatically finds and loads policy packages as plugins. Simply make sure your `package.json`
contains the correct policy packages you wish to load and use.

To assist in policy selection visibility  and traceability, Policy Manager has the ability to display
selection statistics when calling `policyManager.displaySelectionStats()`. Each time your policies
are evaluated as part of a stack preview or stack update, statistics will also be displayed and
recorded in the Pulumi Cloud Service as part of your Pulumi app output.

### Policy cherry-picking

When using Pulumi Premium Policies it's also possible to create finely-tuned Policy Packs by manually
selecting individual policies.

To allow Premium Policy cherry-picking, you need to `import` the policy package in your Policy Pack code.

It is recommended to use `policyManager.selectPolicies()` when cherry-picking Premium Policies so duplicated
policies are removed and your Policy Pack statistics are accurate. Not doing so may lead to duplicate
policy selection, the inability to publish your Policy Pack in your Pulumi organization as well as inaccurate
Policy Pack statistics.

In this example, first the user is manually selecting policies for disabling HTTP traffic on CloudFront
distributions and ensuring encrypted volumes for EBS using the `mandatory` enforcement level.
In the second statement, the user is selecting policies to ensure modern TLS encryption is used on
CloudFront distributions but with an enforcement level of `advisory`.

It's worth noting in the example below that policies need to be individually selected for both classic
and native providers.

```ts
import { PolicyPack } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import * as awsPolicies from "@pulumi-premium-policies/aws-policies";

new PolicyPack("aws-premium-policies-typescript", {
    policies:[
        ...policyManager.selectPolicies([
            awsPolicies.aws.cloudfront.Distribution.disallowUnencryptedTraffic,
            awsPolicies.awsnative.cloudfront.Distribution.disallowUnencryptedTraffic
            awsPolicies.awsnative.ec2.Volume.disallowUnencryptedVolume,
            awsPolicies.aws.ebs.Volume.disallowUnencryptedVolume,
        ], "mandatory"),
        ...policyManager.selectPolicies([
            awsPolicies.aws.cloudfront.Distribution.configureSecureTls,
            awsPolicies.awsnative.cloudfront.Distribution.configureSecureTls,
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
making them easy to navigate. Consider using a modern IDE to leverage code completion, linting and embedded
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
        ...policyManager.selectPolicies([
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

To assist in policy selection visibility and traceability, Policy Manager has the ability to display
selection statistics when calling `policyManager.displaySelectionStats()`. Each times your policies
are evaluated as part of a stack preview or stack update, statistics will also be displayed and
recorded in the Pulumi Cloud Service as part of your Pulumi app output.

This feature allows your organization to track the policies evaluated during a stack update or a preview,
as well as the total number of policies selected, and the Pulumi Premium Policies packages versions
used in your Policy Pack.

To display statistics about your Policy Packs and the Premium Policies in use, simply add the following
statement at the bottom of your Policy Pack.

See [Manual installation](#manual-installation) for more details.

```ts
policyManager.displaySelectionStats({
    displayGeneralStats: true,
    displaySelectedPolicyNames: true,
    displayModuleInformation: true,
});
```

Setting `displayGeneralStats` to `true` will display general statistics about the number of available
policies across all installed policy packages, how many were selected by your Policy Pack and the remaining
number of (unselected) policies.

Setting `displaySelectedPolicyNames` to `true` will dump all the policy names that were selected by your
Policy Pack. This will help you track policy usage over time and when performing any audit.

Finally, setting `displayModuleInformation` to `true` will display the names and versions of your installed
policy packages.

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

For a complete list of available Premium Policy packages, please refer to our reference
[documentation](http://FIXME).

If NPM returns a `HTTP 403 - Access Denied`, then either the provided Pulumi Access Token is invalid,
or the Token doesn't belong to a Pulumi Organization that has subscribed to the Business Critical Plan.

Contact our [sales team](https://www.pulumi.com/pricing/) to learn more about our Business Critical plan.

## Policy Pack Execution

Policy Packs using Pulumi Premium Policies bear no differences to vanilla Policy Packs. It's possible
to run Policy packs locally or have them enforced across your Pulumi Organization.

If a Policy Pack needs to be installed at a time of a preview or an update, the Pulumi CLI will transparently
take care of those steps on behalf of the user.

Please refer to our [documentation](https://www.pulumi.com/docs/using-pulumi/crossguard/configuration/)
for more details.

## Performance

Pulumi Premium Policies have been designed from the ground up to be efficient from the start. However,
like any software, we recommend Policy Pack Authors to be mindful of how they implement their Policy
Packs.

Pulumi recommends avoiding installing policy packages for vendors you don't use. Doing so will reduce
memory usage and will make the execution of your Pulumi app faster.

Pulumi recommends loading Premium Policies for only services and resources you intend to use. This will
result in faster Pulumi app execution.

Consider using multiple policy packs (one for each vendor) as this will result in faster installation
but at the expense of a slightly slower execution and larger memory footprint.

Pulumi also recommends upgrading your Pulumi Premium Policy packages regularly. Many Policies are added
and updated on a regular basis giving you better Infrastructure as Code guardrails.

## Troubleshooting and support

### Getting HTTP 403 when installing Pulumi Premium Policies

* Your Pulumi organization needs to have access to Policy-as-Code, a feature available to Business
  Critical customers.
* Your Policy Pack may be missing its `.npmrc`, or its content is incorrect.
* The value for `PULUMI_ACCESS_TOKEN` is incorrect, or your token doesn't belong to a Pulumi organization
  that has access to Policy-as-Code.

To resolve this, follow the steps described in the [manual installation](#manual-installation) documentation.

### Policy Pack is empty

At times, your Policy Pack may appear to be empty (ie, no policy is evaluated). There are 2 main reasons
for this to happen.

First, an incomplete upgrade was performed and some Premium Policies packages aren't on the latest version.

To address this issue, upgrade both the Policy Manager and the Premium Policies packages to the latest
version as described in the [Policy package upgrade documentation](#policy-packages-upgrade) above.

Second, at times the `node_modules` may reference NPM packages incorrectly. Remove the `node_modules`
directory and reinstall all your NPM packages.

## Support & feature request

Additional support is available through our usual channels.

We encourage you to contact us via your dedicated Slack channel and ask questions directly there where
possible.

You may also open a new support ticket using our support center portal available at <https://support.pulumi.com/hc/en-us>.

If you wish to report a bug or request a new feature (like a new policy), open a new public issue at
<https://github.com/pulumi/premium-policies-requests/issues/new/choose>
