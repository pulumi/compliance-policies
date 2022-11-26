import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

/**
 * @description Checks that Lambda functions have tracing enabled.
 */
export const functionTracingEnabled: ResourceValidationPolicy = {
    name: "aws-lambda-function-disallow-lambda-without-tracing",
    description: "Checks that Lambda functions have tracing enabled.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.lambda.Function, (f, args, reportViolation) => {
        if (f.tracingConfig?.mode !== "Active") {
            reportViolation("Lambda functions should have tracing enabled.");
        }
    }),
};