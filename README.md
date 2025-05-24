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

## Security Frameworks

This repository includes comprehensive documentation for implementing various security and compliance frameworks across cloud providers. Each framework guide provides:

- Detailed control mappings to cloud services
- Implementation checklists and best practices
- Continuous compliance guidance
- References to official standards

### Supported Frameworks

- **[ISO 27001](frameworks/)** - International standard for information security management systems
- **[PCI DSS](frameworks/)** - Payment Card Industry Data Security Standard
- **[HITRUST CSF](frameworks/)** - Health Information Trust Alliance Common Security Framework
- **[CIS Controls](frameworks/)** - Center for Internet Security Controls
- **[SOC 2 Type II](frameworks/)** - Service Organization Control 2
- **[NIST CSF](frameworks/)** - National Institute of Standards and Technology Cybersecurity Framework
- **[HIPAA](frameworks/)** - Health Insurance Portability and Accountability Act
- **[SOX](frameworks/)** - Sarbanes-Oxley Act
- **[GDPR](frameworks/)** - General Data Protection Regulation
- **[FedRAMP](frameworks/)** - Federal Risk and Authorization Management Program
- **[Microsoft Cloud Security Benchmark](frameworks/)** - Azure-specific security framework (Azure only)

### Framework Documentation

- **[Framework Overview](frameworks/README.md)** - Complete guide to framework documentation
- **[Framework Index](frameworks.json)** - Master index of all supported frameworks
- **[ISO 27001 Controls](frameworks/data/framework-iso27001.json)** - All 93 controls across 14 clauses
- **[Policy Coverage Analysis](frameworks/analyze-policy-coverage.js)** - Script to analyze policy mappings

### Cloud-Specific Framework Implementation Guides

#### AWS Implementation Guides
- **[AWS SOC 2 Type II](frameworks/aws/soc2.md)** - 60% policy coverage
- **[AWS PCI DSS v4.0](frameworks/aws/pcidss.md)** - Payment card compliance
- **[AWS ISO 27001:2022](frameworks/aws/iso27001.md)** - 40% implementation coverage
- **[AWS CIS Controls v8.0](frameworks/aws/cis.md)** - 20% implementation coverage
- **[AWS NIST Cybersecurity Framework](frameworks/aws/nist.md)** - 20% coverage

#### Azure Implementation Guides  
- **[Azure SOC 2 Type II](frameworks/azure/soc2.md)** - Implementation roadmap
- **[Azure PCI DSS v4.0](frameworks/azure/pcidss.md)** - Payment card compliance

#### Google Cloud Implementation Guides
- **[Google Cloud SOC 2 Type II](frameworks/google/soc2.md)** - Implementation roadmap
- **[Google Cloud PCI DSS v4.0](frameworks/google/pcidss.md)** - Payment card compliance

#### Kubernetes Implementation Guides
- **[Kubernetes SOC 2 Type II](frameworks/kubernetes/soc2.md)** - Container security focus
- **[Kubernetes CIS Controls](frameworks/kubernetes/cis.md)** - Security benchmarks

## Resources

Read more about Compliance-Ready Policies at <https://www.pulumi.com/docs/using-pulumi/crossguard/compliance-ready-policies/>.
