# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test/Lint Commands

- Build: `yarn build` or `npm run build` (TypeScript compilation)
- Lint: `yarn lint` or `npm run lint` (ESLint for TypeScript files)
- Fix linting issues: `yarn lintfix` or `npm run lintfix`
- Run all tests: `yarn test` or `npm run test`
- Run a single test: `yarn targettedtest tests/path/to/test.spec.ts` or `npm run targettedtest tests/path/to/test.spec.ts`
- Watch tests: `yarn watchtest` or `npm run watchtest`

## Code Style Guidelines

- Use 4-space indentation (ESLint enforced)
- Use double quotes for strings
- Use semicolons at the end of statements
- Include trailing commas in multi-line structures
- Always use curly braces for control statements
- File headers must include copyright notice
- Policy exports require JSDoc with @severity, @link, @topics, and @frameworks tags
- Use strict null checks (strictNullChecks: true)
- Follow member ordering: static fields, instance fields, static methods, instance methods
- Each test file should test one policy implementation
- Avoid any implicit types where possible

## Repository Structure

- The folders starting with `vendor-` contain policies specific to that cloud vendor
- There are root folders prefixed `vendor` for the following cloud technologies:
  - AWS: `vendor-aws`
  - Azure: `vendor-azure`
  - Google Cloud: `vendor-google`
  - Kubernetes: `vendor-kubernetes`
- Within a vendor folder, policies for a specific resource type are structured according the type
  - `aws.ec2.Instance` will map to folder structure `aws/ec2/Instance`
  - the leaf folder for the resource type contains a Typescript file per policy
  - the name of the policy starts with the resource type, followed by what it is verifying
  - the name of the policy is written all with hyphens between every word
  - the file containing the policy is named after what it is verifying without the resource type
  - the file containing the policy is written in camel case
- Specifically for AWS, within the `vendor-aws` folder, you have two subfolders because we have 2
  Pulumi providers, `pulumi-aws` and `pulumi-aws-native`. Policies need to be written for both
  providers when possible.
- policy can only be implemented using the Pulumi resource input properties. These can be found
  in the corresponding `Args` class for each resource type.
- a policy should be written with the properties in the following order:
  - name
  - description
  - configSchema
  - enforcementLevel
  - validateResource
  - vendors
  - services
  - severity
  - topics
  - frameworks
- a policy requires documentation in JSDoc format, repeating the `severity`, `frameworks` and `topics` properties

## Framework Documentation

- The `frameworks.json` file is the master index of all compliance frameworks
- Framework definitions are in `frameworks/data/framework-{name}.json` files
- Cloud-specific implementation guides are organized in `frameworks/{cloud}/{framework}.md` directories:
  - AWS guides: `frameworks/aws/soc2.md`, `frameworks/aws/pcidss.md`, etc.
  - Azure guides: `frameworks/azure/soc2.md`, `frameworks/azure/pcidss.md`, etc.
  - Google Cloud guides: `frameworks/google/soc2.md`, `frameworks/google/pcidss.md`, etc.
  - Kubernetes guides: `frameworks/kubernetes/soc2.md`, `frameworks/kubernetes/cis.md`, etc.
- When adding new policies, ensure the framework references match those defined in the framework JSON files
- Supported frameworks: iso27001, pcidss, hitrust, cis, soc2, nist, hipaa, sox, gdpr, fedramp
- Microsoft Cloud Security Benchmark (microsoftcloudsecuritybenchmark) is Azure-specific only

### Maintaining Framework Files

When updating framework documentation:
1. Update the appropriate `frameworks/data/framework-{name}.json` file with complete control mappings
2. Add `pulumi_policies` array to controls that have corresponding policies
3. Ensure all domains and controls are included, even if no policies exist yet
4. Update cloud-specific recommendations based on new services or features
5. Keep compliance_level, automation_possible, and verification_method fields accurate
6. Add references to official documentation and standards

### Framework JSON Structure

The master `frameworks.json` contains:
- Framework ID as key
- `file`: Path to the detailed framework JSON
- `name`: Official framework name with version
- `description`: Brief description

Each framework file in `frameworks/data/` contains:
- `framework`: Official framework name and version
- `description`: Framework description
- `version`: Framework version
- `domains` or `requirements`: Major areas of the framework
  - `controls`: Specific controls within each domain
    - `id`: Official control identifier
    - `title`: Control title
    - `description`: Control description
    - `pulumi_policies`: Array of Pulumi policy names that implement this control
    - `compliance_level`: required/recommended/optional
    - `automation_possible`: true/false
    - `verification_method`: automated/manual
    - `references`: Links to official documentation
    - `clouds`: Cloud-specific implementations for AWS, Azure, Google, and Kubernetes

## Important Restrictions

- **NEVER RUN GIT COMMIT**: Do not attempt to create commits. Only the user should create commits.
- **NEVER MODIFY .git DIRECTORY**: Do not attempt to directly modify the git repository.
- **NEVER CREATE PULL REQUESTS**: Do not attempt to create or submit pull requests.
