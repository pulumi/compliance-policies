// Copyright 2016-2025, Pulumi Corporation.

import { BucketV2 } from "@pulumi/aws/s3";
import { PolicyViolation, registerPolicy } from "@pulumi/compliance-policy-manager";

/**
 * Checks that S3 buckets using replication have encryption configured for the destination bucket.
 * @severity high
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication-config-for-kms-objects.html
 * @topics encryption, storage
 * @frameworks iso27001, pcidss
 */
export const s3BucketV2DisallowUnencryptedReplicationDestination = registerPolicy({
    name: "aws-s3-bucketv2-disallow-unencrypted-replication-destination",
    description: "S3 buckets with replication must have encryption configured for the destination bucket.",
    enforcementLevel: "advisory",
    validateResource: (args, _, reportViolation) => {
        if (args.resourceType === BucketV2) {
            const replicationConfigurations = args.props.replicationConfigurations;
            if (replicationConfigurations && replicationConfigurations.length > 0) {
                replicationConfigurations.forEach((config: any) => {
                    if (config.rules && config.rules.length > 0) {
                        config.rules.forEach((rule: any, ruleIndex: number) => {
                            if (rule.destinations && rule.destinations.length > 0) {
                                rule.destinations.forEach((destination: any, destIndex: number) => {
                                    if (!destination.replicaKmsKeyId) {
                                        reportViolation(
                                            `S3 bucket replication rule ${ruleIndex} destination ${destIndex} does not have encryption configured. ` +
                                            `Set 'replicationConfigurations[${0}].rules[${ruleIndex}].destinations[${destIndex}].replicaKmsKeyId' to a valid KMS key ID.`
                                        );
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "high",
    topics: ["encryption", "storage"],
    frameworks: ["iso27001", "pcidss"],
});
