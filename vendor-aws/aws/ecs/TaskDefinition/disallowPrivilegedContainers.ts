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
 * Checks that ECS task definitions do not have privileged containers.
 *
 * @severity high
 * @frameworks cis
 * @topics security, containers
 * @link https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_security
 */
export const disallowPrivilegedContainers: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecs-taskdefinition-disallow-privileged-containers",
        description: "Ensures that ECS task definitions do not have containers with 'privileged' set to 'true', which would give containers elevated permissions on the host.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(TaskDefinition, (taskDef, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            // Check container definitions for privileged mode
            if (taskDef.containerDefinitions) {
                try {
                    // Parse containerDefinitions if it's a string
                    const containerDefs = typeof taskDef.containerDefinitions === "string"
                        ? JSON.parse(taskDef.containerDefinitions)
                        : taskDef.containerDefinitions;

                    if (Array.isArray(containerDefs)) {
                        for (const container of containerDefs) {
                            if (container.privileged === true) {
                                reportViolation(
                                    `Container '${container.name || "unnamed"}' in ECS task definition has 'privileged' set to true. Privileged containers can access host resources, which is a security risk.`
                                );
                            }
                        }
                    }
                } catch (error) {
                    // If containerDefinitions is malformed, we can't validate it
                    reportViolation(
                        "Unable to parse container definitions to check for privileged containers. Ensure the definitions are valid JSON."
                    );
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecs"],
    severity: "high",
    topics: ["security", "containers"],
    frameworks: ["cis"],
});
