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
 * Checks that ECS task definitions do not share the host PID namespace.
 *
 * @severity high
 * @frameworks cis
 * @topics security, containers
 * @link https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#task_definition_pidmode
 */
export const disallowHostPidMode: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecs-taskdefinition-disallow-host-pid-mode",
        description: "Ensures that ECS task definitions do not have 'pidMode' set to 'host', which could allow containers to gain visibility into processes running on the host.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(TaskDefinition, (taskDef, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            if (taskDef.pidMode === "host") {
                reportViolation(
                    "ECS task definitions should not have 'pidMode' set to 'host'. This setting allows containers to see all processes on the host, which is a security risk."
                );
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecs"],
    severity: "high",
    topics: ["security", "containers"],
    frameworks: ["cis"],
});
