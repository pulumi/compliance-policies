# Compliance Frameworks Documentation

This directory contains detailed implementation guides for various compliance frameworks across different cloud providers.

## Structure

The framework documentation is organized as follows:
- `frameworks.json` - Master index file listing all frameworks
- `data/framework-{framework}.json` - Comprehensive framework definitions with all controls
- `{cloud}-{framework}.md` - Cloud-specific implementation guides

## Supported Frameworks

1. **ISO 27001** - International standard for information security management
2. **PCI DSS** - Payment Card Industry Data Security Standard
3. **HITRUST CSF** - Health Information Trust Alliance Common Security Framework
4. **CIS Controls** - Center for Internet Security Controls
5. **SOC 2 Type II** - Service Organization Control 2
6. **NIST CSF** - National Institute of Standards and Technology Cybersecurity Framework
7. **HIPAA** - Health Insurance Portability and Accountability Act
8. **SOX** - Sarbanes-Oxley Act
9. **GDPR** - General Data Protection Regulation
10. **FedRAMP** - Federal Risk and Authorization Management Program
11. **Microsoft Cloud Security Benchmark** - Azure-specific security framework

## Framework Data Structure

Each framework JSON file in the `data/` directory contains:
- Complete list of all framework domains/requirements
- Every control with official ID and description
- Pulumi policies that map to each control (where applicable)
- Cloud-specific implementations for AWS, Azure, Google Cloud, and Kubernetes
- Automation capabilities and verification methods
- Compliance levels (required/recommended/optional)
- References to official documentation

The master `frameworks.json` file provides an index to all framework files.

## Usage

1. **For Compliance Teams**: Use these guides to understand which Pulumi policies support your compliance requirements
2. **For DevOps Teams**: Reference the implementation checklists and best practices
3. **For Security Teams**: Use the continuous compliance sections for ongoing monitoring

## Adding New Frameworks

When adding support for a new framework:

1. Update `frameworks.json` with the framework structure
2. Create cloud-specific markdown files following the existing format
3. Include:
   - Overview and framework description
   - Detailed control mappings
   - Implementation checklists
   - Continuous compliance guidance
   - References to official documentation

## Current Coverage

| Framework | AWS | Azure | Google Cloud | Kubernetes |
|-----------|-----|-------|--------------|------------|
| ISO 27001 | ✓   | ✓     | ✓            | ✓          |
| PCI DSS   | ✓   | ✓     | ✓            | ✓          |
| HITRUST   | ✓   | ✓     | ✓            | ✓          |
| CIS       | ✓   | ✓     | ✓            | ✓          |
| SOC 2     | ✓   | ✓     | ✓            | ✓          |
| NIST      | ✓   | ✓     | ✓            | ✓          |
| HIPAA     | ✓   | ✓     | ✓            | ✓          |
| SOX       | ✓   | ✓     | ✓            | ✓          |
| GDPR      | ✓   | ✓     | ✓            | ✓          |
| FedRAMP   | ✓   | ✓     | ✓            | ✓          |
| MCSB      | ✓   | ✓     | ✓            | ✓          |

## Contributing

When contributing to framework documentation:
1. Ensure accuracy of control mappings
2. Keep cloud-specific recommendations up to date
3. Test implementation guidance
4. Update both JSON and markdown files
5. Include references to official standards

## References

- [Pulumi Compliance Policies Documentation](https://www.pulumi.com/docs/guides/crossguard/)
- [Cloud Provider Compliance Resources](#)
  - [AWS Compliance](https://aws.amazon.com/compliance/)
  - [Azure Compliance](https://docs.microsoft.com/en-us/azure/compliance/)
  - [Google Cloud Compliance](https://cloud.google.com/security/compliance)
  - [Kubernetes Security](https://kubernetes.io/docs/concepts/security/)