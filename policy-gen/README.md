# Policy Gen

Policy Gen is a toll that reads a provider's schema, finds new possible policies and generates them.

## Features

* Download a schema for a given provider@version
* Generate policies to block specific services, resources
  * Kubernetes `*alpha*` apis
* Find new possible policies

## TODO

* Display statistics about a provider
* Save state of already seen services, resources and properties
* k8s: Generate policies to block specific api versions
* Azure Native: Generate policies to block specific api versions
* Detect new services, resources and properties
* Find already existing policies

## Ideas

* Store details about services, resources and properties on when they first appeared

## Helpful commands

```bash
pulumi package get-schema aws@5.24.0
```

```bash
# fish
git status | grep tests/ | grep resource.ts | awk '{print $1}' | sort -du | while read F; code -r "$F"; sleep 0.3; end
# bash
git status | grep tests/ | grep resource.ts | sort -du | while read F; do code -r "$F"; sleep 1; done
```
