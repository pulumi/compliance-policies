// Copyright 2016-2025, Pulumi Corporation.
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

import { Service } from "@pulumi/aws/ecs";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that ECS services have the required tags.
 *
 * @severity medium
 * @frameworks cis
 * @topics tagging, operations
 * @link https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-using-tags.html
 */
export const requireTags: ResourceValidationPolicy =
  policyManager.registerPolicy({
      resourceValidationPolicy: {
          name: "aws-ecs-service-require-tags",
          description:
        "Ensures that ECS services have appropriate tags to assist with management and compliance.",
          configSchema: {
              ...policyManager.policyConfigSchema,
              properties: {
                  ...policyManager.policyConfigSchema.properties,
                  requiredTags: {
                      type: "array",
                      items: { type: "string" },
                      description:
              "List of tag names that must be present on all ECS services.",
                  },
                  minTagCount: {
                      type: "number",
                      description: "Minimum number of tags required on ECS services.",
                  },
              },
          },
          enforcementLevel: "advisory",
          validateResource: validateResourceOfType(
              Service,
              (service, args, reportViolation) => {
                  if (!policyManager.shouldEvalPolicy(args)) {
                      return;
                  }

                  const { requiredTags = [], minTagCount = 1 } =
            args.getConfig<{
                requiredTags?: string[];
                minTagCount?: number;
            }>() || {};

                  // Check if tags exist and if there are any
                  if (!service.tags || Object.keys(service.tags).length === 0) {
                      reportViolation(
                          "ECS Service does not have any tags. All ECS Services should have tags to assist with management and compliance.",
                      );
                      return;
                  }

                  // Check for the number of tags
                  const tagCount = Object.keys(service.tags).length;
                  if (tagCount < minTagCount) {
                      reportViolation(
                          `ECS Service has ${tagCount} tags but the required minimum is ${minTagCount}.`,
                      );
                  }

                  // Check for required tags
                  for (const requiredTag of requiredTags) {
                      if (!service.tags[requiredTag]) {
                          reportViolation(
                              `ECS Service is missing required tag: ${requiredTag}`,
                          );
                      }
                  }
              },
          ),
      },
      vendors: ["aws"],
      services: ["ecs"],
      severity: "medium",
      topics: ["tagging", "operations"],
      frameworks: ["cis"],
  });
