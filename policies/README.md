# Pulumi Policies

In this folder, you will find all individual Pulumi policies.

The documentation below should guide you in understanding the following topics:

- How to write policies in an efficient and consistent way
- How to write unit tests for your policies
- How to test, lint and build the policies

## Project structure

The project is structured to follow the same way providers are organized. This structure is also found in the way how policies are grouped and organized throughout the entire code base.

Unless stated ortherwise, all folders should be `lower case`.
<details>
<summary>Folder structure overview</summary>

```
├── bin                                         <- transpiled TypeScript files into JavaScript
├── build                                       <- 🧰 scripts and tools to assist in managing the code base
├── aws                                         <- 📦 policies for the AWS Classic provider
│   ├── index.ts
│   ├── apigatewayv2
│   │   ├── index.ts
│   │   ├── domainName.ts
│   │   └── ....ts
│   ├── cloudfront                              <- 🌿 policies for the CloudFront service
│   │   ├── index.ts
│   │   └── distribution.ts
│   ├── ...
│   ·   ├── index.ts
│   ·   └── ....ts
│   ·
│
├── awsnative                                   <- 📦 policies for the AWS Native provider
│   ├── index.ts
│   ├── cloudfront                              <- 🌿 policies for the CloudFront service
│   │   ├── index.ts
│   │   └── distribution.ts
│   ├── ...
│   ·   ├── index.ts
│   ·   └── ....ts
│   ·
│
├── kubernetes                                  <- 📦 contains policies for the Kubernetes provider
│   ├── index.ts
│   ├── apps
│   │   ├── index.ts
│   │   └── v1
│   │       ├── index.ts
│   │       ├── deployment.ts
│   │       └── ....ts
│   ├── core
│   │   ├── index.ts
│   │   ├── v1
│   ·   ·   ├── index.ts
│   ·   ·   └── ....ts
│   ·   ·
│
├── tests                                       <- 🧪 unit tests organized per provider and as shown above
│   ├── utils.ts
│   ├── aws                                     <- 🧪 unit tests for the 📦 AWS Classic provider
│   │   ├── enums.ts
│   │   ├── apigatewayv2
│   │   │   ├── domainName.spec.ts
│   │   │   └── stage.spec.ts
│   │   ├── cloudfront                          <- 🧪 unit tests for the 🌿 CloudFront service
│   │   │   └── distribution.spec.ts
│   │   ├── ...
│   │   ·   └── ....spec.ts
│   │   ·
│   │   ·
│   │
│   ├── awsnative                               <- 🧪 unit tests for the 📦 AWS Native provider
│   │   ├── cloudfront                          <- 🧪 unit tests for the 🌿 CloudFront service
│   │   │   └── distribution.spec.ts
│   │   ├── ...
│   │   │   └── ....spec.ts
│   │   │
│   │   │
│   │   │
·   ·   ·
·   ·   ·
·   ·   ·
```

</details>

