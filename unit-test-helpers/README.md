# Premium Policies Unit Tests helpers

`@pulumi-premium-policies/unit-test-helpers` is a comprehensive TypeScript package designed to
provide developers with a set of powerful and versatile functions to streamline the process of
writing and executing unit tests.

This package aims to simplify unit testing across Pulumi Premium Policy packages, ensuring code
reliability and maintainability.

## Building and publishing process

### Requirements

To build `@pulumi-premium-policies/unit-test-helpers`, you will need to have access to the
Premium Policy package repository and set a valid `CODEARTIFACT_AUTH_SOCKET`.

```bash
# sh, bash, or zsh
export CODEARTIFACT_AUTH_TOKEN="$(aws --region ap-southeast-2 codeartifact get-authorization-token --domain pulumi-policy-as-code --query authorizationToken --output text)"
```

```fish
# fish
set -gx CODEARTIFACT_AUTH_TOKEN (aws --region ap-southeast-2 codeartifact get-authorization-token --domain pulumi-policy-as-code --query authorizationToken --output text)
```

### Code linting

Check the code passes linting validation.

```bash
make lint
```

### Building

The package version is automatically determined based on the previous GIT tag version, and whether
the current directory is `dirty` or all changes have been committed.

If changes are unstaged, a `+dirty` suffix is added to the version number. For example `0.0.14+dirty`.

To build the package, simply run:

```bash
make build
```

### Publishing

Publishing the package will make the package available to Pulumi users who have access to the
Premium Policy repository (via their Business Critical subscription).

To publish a new package, run:

```bash
make publish
```

Once the process has completed, the command also creates a new GIT Tag with the relevant version.
