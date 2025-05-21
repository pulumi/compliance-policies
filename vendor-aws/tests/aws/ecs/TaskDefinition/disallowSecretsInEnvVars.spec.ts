// Copyright 2016-2024, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import "mocha";
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getResourceValidationArgs } from "./resource";

describe("aws.ecs.TaskDefinition.disallowSecretsInEnvVars", function() {
    const policy = policies.aws.ecs.TaskDefinition.disallowSecretsInEnvVars;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-ecs-taskdefinition-disallow-secrets-in-env-vars");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["ecs"],
            severity: "high",
            topics: ["security", "containers", "secrets"],
            frameworks: ["cis"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("policy-config-include", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "corp-resource" ],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("policy-config-exclude", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "some-resource" ],
        });
        await assertNoResourceViolations(policy, args);
    });

    it("#1 - safe environment variables pass", async function() {
        const args = getResourceValidationArgs();
        const containerDefs = JSON.parse(args.props.containerDefinitions as string);
        containerDefs[0].environment = [
            { name: "PORT", value: "8080" },
            { name: "DEBUG", value: "true" },
            { name: "APP_NAME", value: "my-app" },
        ];
        args.props.containerDefinitions = JSON.stringify(containerDefs);
        await assertNoResourceViolations(policy, args);
    });

    it("#2 - password in environment variable fails", async function() {
        const args = getResourceValidationArgs();
        const containerDefs = JSON.parse(args.props.containerDefinitions as string);
        containerDefs[0].environment = [
            { name: "PORT", value: "8080" },
            { name: "DB_PASSWORD", value: "secret123" },
        ];
        args.props.containerDefinitions = JSON.stringify(containerDefs);
        await assertHasResourceViolation(policy, args, {
            message: "Container 'app' in ECS task definition has potentially sensitive data in environment variable 'DB_PASSWORD'. Use 'secrets' container definition property or AWS Secrets Manager instead.",
        });
    });

    it("#3 - API key in environment variable fails", async function() {
        const args = getResourceValidationArgs();
        const containerDefs = JSON.parse(args.props.containerDefinitions as string);
        containerDefs[0].environment = [
            { name: "API_KEY", value: "abcdef123456" },
        ];
        args.props.containerDefinitions = JSON.stringify(containerDefs);
        await assertHasResourceViolation(policy, args, {
            message: "Container 'app' in ECS task definition has potentially sensitive data in environment variable 'API_KEY'. Use 'secrets' container definition property or AWS Secrets Manager instead.",
        });
    });

    it("#4 - custom pattern detects sensitive env var", async function() {
        const args = getResourceValidationArgs();
        args.getConfig = () => ({
            sensitiveEnvVarPatterns: ["(?i).*connection_string.*"],
        } as any);
        const containerDefs = JSON.parse(args.props.containerDefinitions as string);
        containerDefs[0].environment = [
            { name: "CONNECTION_STRING", value: "server=myserver;user=admin;password=secret;" },
        ];
        args.props.containerDefinitions = JSON.stringify(containerDefs);
        await assertHasResourceViolation(policy, args, {
            message: "Container 'app' in ECS task definition has potentially sensitive data in environment variable 'CONNECTION_STRING'. Use 'secrets' container definition property or AWS Secrets Manager instead.",
        });
    });

    it("#5 - malformed container definitions fail", async function() {
        const args = getResourceValidationArgs();
        args.props.containerDefinitions = "{malformed json";
        await assertHasResourceViolation(policy, args, {
            message: "Unable to parse container definitions to check for secrets in environment variables. Ensure the definitions are valid JSON.",
        });
    });
});
