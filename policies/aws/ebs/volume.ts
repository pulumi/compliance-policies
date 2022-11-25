import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import * as aws from "@pulumi/aws";

/**
 * @description Checks that no EBS is unencrypted.
 */
export const volumeNoUnencryptedVolume: ResourceValidationPolicy = {
    name: "disallow-unencrypted-volume",
    description: "Checks that no EBS is unencrypted.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(aws.ebs.Volume, (v, args, reportViolation) => {
        if (!v.encrypted) {
            reportViolation("An EBS volume is not encrypted.");
        }
    }),
};

/**
 * @description Check that encrypted EBS volume uses a customer-managed KMS key.
 */
 export const volumeWithCustomerManagedKey: ResourceValidationPolicy = {
    name: "disallow-volume-without-customer-managed-key",
    description: "Check that encrypted EBS volume uses a customer-manager KMS key.",
    validateResource: validateResourceOfType(aws.ebs.Volume, (v, args, reportViolation) => {
        if (v.kmsKeyId !== undefined && v.kmsKeyId !== "") {
            reportViolation("An EBS volume should be encrypted with a customer-managed KMS key.");
        }
    }),
};
