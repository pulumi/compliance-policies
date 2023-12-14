# Pulumi Compliance-Ready Policies

This repository contains a growing set of Compliance Policies to validate your infrastructure using
Pulumi's Crossguard Policy-as-Code framework.

These policies make it easy to create policy packs for enforcing common security and compliance
policies (PCI DSS, ISO 27001 and CIS) across a broad range of cloud providers (AWS, Azure, Google Cloud
and Kubernetes), and dozens of services within each platform.

```ts
import { PolicyPack } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

new PolicyPack("aws-iso27001-compliance-ready-policies-typescript", {
    policies:[
        ...policyManager.selectPolicies({
            vendors: ["aws"],
            services: ["ec2", "eks"],
            severities: ["critical", "high"],
            frameworks: ["iso27001"]
        }, "advisory"),
    ],
});
```

## Getting Started

You can get started with Compliance-Ready Policies by running the following commands, which will guide
you through selecting from the available compliance-ready policy templates:

```shell
pulumi policy new
```

And then publishing the selected policies into your Pulumi organization.

```shell
pulumi policy publish
```

## Resources

Read more about Compliance-Ready Policies at <https://www.pulumi.com/docs/using-pulumi/crossguard/compliance-ready-policies/>.
