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

import * as aws from "@pulumi/aws";
import { ResourceValidationArgs } from "@pulumi/policy";
import { PolicyConfigSchemaArgs } from "@pulumi/compliance-policy-manager";
import * as enums from "../../enums";
import { createResourceValidationArgs } from "@pulumi/compliance-policies-unit-test-helpers";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(resourceName?: string, policyconfig?: PolicyConfigSchemaArgs): ResourceValidationArgs {
    const containerDefinitions = JSON.stringify([
        {
            name: "app",
            image: "amazon/amazon-ecs-sample",
            cpu: 256,
            memory: 512,
            essential: true,
            portMappings: [
                {
                    containerPort: 80,
                    hostPort: 80,
                },
            ],
            privileged: false,
        },
    ]);

    return createResourceValidationArgs(aws.ecs.TaskDefinition, {
        family: "service",
        cpu: "256",
        memory: "512",
        networkMode: "awsvpc",
        requiresCompatibilities: ["FARGATE"],
        executionRoleArn: "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
        containerDefinitions: containerDefinitions,
        pidMode: "task", // Default to task-scoped PID namespace
    }, policyconfig, resourceName);
}
