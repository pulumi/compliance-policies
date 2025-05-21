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

## Important Restrictions

- **NEVER RUN GIT COMMIT**: Do not attempt to create commits. Only the user should create commits.
- **NEVER MODIFY .git DIRECTORY**: Do not attempt to directly modify the git repository.
- **NEVER CREATE PULL REQUESTS**: Do not attempt to create or submit pull requests.
