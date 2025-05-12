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

import { TaskDefinition } from "@pulumi/aws/ecs";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that ECS task definitions do not have secrets passed as environment variables.
 *
 * @severity high
 * @frameworks cis
 * @topics security, containers, secrets
 * @link https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data.html
 */
export const disallowSecretsInEnvVars: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecs-taskdefinition-disallow-secrets-in-env-vars",
        description: "Ensures that ECS task definitions do not pass secrets as container environment variables. Secrets should be passed using the 'secrets' container definition property or Secrets Manager.",
        configSchema: {
            ...policyManager.policyConfigSchema,
            properties: {
                ...policyManager.policyConfigSchema.properties,
                sensitiveEnvVarPatterns: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of regex patterns for potentially sensitive environment variable names.",
                    default: [
                        "(?i).*pass(word)?.*",
                        "(?i).*secret.*",
                        "(?i).*key.*",
                        "(?i).*token.*",
                        "(?i).*credential.*",
                        "(?i).*access.*key.*",
                        "(?i).*auth.*",
                        "(?i).*sign(ature)?.*",
                        "(?i).*cert(ificate)?.*",
                        "(?i).*private.*"
                    ],
                },
            },
        },
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(TaskDefinition, (taskDef, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            // Get the configured patterns for sensitive environment variables
            const { sensitiveEnvVarPatterns = [
                "(?i).*pass(word)?.*",
                "(?i).*secret.*",
                "(?i).*key.*", 
                "(?i).*token.*",
                "(?i).*credential.*",
                "(?i).*access.*key.*",
                "(?i).*auth.*",
                "(?i).*sign(ature)?.*",
                "(?i).*cert(ificate)?.*",
                "(?i).*private.*"
            ] } = args.getConfig<{
                sensitiveEnvVarPatterns?: string[];
            }>() || {};

            const patterns = sensitiveEnvVarPatterns.map(pattern => new RegExp(pattern));

            // Check container definitions for environment variables
            if (taskDef.containerDefinitions) {
                try {
                    // Parse containerDefinitions if it's a string
                    const containerDefs = typeof taskDef.containerDefinitions === 'string' 
                        ? JSON.parse(taskDef.containerDefinitions) 
                        : taskDef.containerDefinitions;

                    if (Array.isArray(containerDefs)) {
                        for (const container of containerDefs) {
                            if (container.environment) {
                                for (const envVar of container.environment) {
                                    const envName = envVar.name;
                                    
                                    // Check if this env var name matches any of our sensitive patterns
                                    for (const pattern of patterns) {
                                        if (pattern.test(envName)) {
                                            reportViolation(
                                                `Container '${container.name || "unnamed"}' in ECS task definition has potentially sensitive data in environment variable '${envName}'. Use 'secrets' container definition property or AWS Secrets Manager instead.`
                                            );
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    // If containerDefinitions is malformed, we can't validate it
                    reportViolation(
                        "Unable to parse container definitions to check for secrets in environment variables. Ensure the definitions are valid JSON."
                    );
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecs"],
    severity: "high",
    topics: ["security", "containers", "secrets"],
    frameworks: ["cis"],
});