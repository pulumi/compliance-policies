# Policy Docs Updater

Policy Docs Updater is a tool to read the policies source files and add
or update the policy leading comment in a consistent way.

This tools also does a bit of code formatting due to the way `prettier` works.

## Execution

```bash
make runaws
make runazure
make runkubernetes
# run all the above
make run
```

## Usage

```
# command: updatedocs
# vendor-directory: /path/to/vendor/policy
# providerX: the relative directory name for each provider as found inside vendor-directory
yarn run <command> --directory <vendor-directory> --providers <provider1,provider2,...>
```

```bash
yarn run updatedocs --directory ../vendor-aws --providers aws,awsnative
```
