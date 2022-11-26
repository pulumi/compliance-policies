// Copyright 2016-2022, Pulumi Corporation.
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
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";

/**
 * @description Checks that ECR repositories have scan on push enabled.
 */
export const repositoryImageScans: ResourceValidationPolicy = {
    name: "aws-ecr-repository-disallow-repo-without-image-scans",
    description: "Checks that ECR repositories have scan on push enabled.",
    enforcementLevel: "advisory",
    validateResource:
    validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (!repo.imageScanningConfiguration?.scanOnPush) {
            reportViolation("ECR image scanning on push should be enabled.");
        }
    }),
};

/**
 * @description Checks that ECR repositories have immutable images enabled.
 */
export const repositoryImmutableImage: ResourceValidationPolicy = {
    name: "aws-ecr-repository-disallow-repo-without-immutable-image",
    description: "Checks that ECR repositories have immutable images enabled.",
    enforcementLevel: "advisory",
    validateResource:
    validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
        if (repo.imageTagMutability !== "IMMUTABLE") {
            reportViolation("ECR repositories should have immutable images");
        }
    }),
};
