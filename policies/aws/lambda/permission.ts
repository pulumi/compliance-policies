import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

/**
 * @description Checks that lambda function permissions have a source arn specified.
 */
export const functionSourceArn: ResourceValidationPolicy = {
    name: "aws-lambda-permission-disallow-permission-without-source-arn",
    description: "Checks that lambda function permissions have a source arn specified.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.lambda.Permission, (f, args, reportViolation) => {
        if (f.sourceArn === undefined) {
            reportViolation("Lambda function permissions should have a source ARN defined.");
        }
    }),
};