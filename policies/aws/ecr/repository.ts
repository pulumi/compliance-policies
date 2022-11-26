import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

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