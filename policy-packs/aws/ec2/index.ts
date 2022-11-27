import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";
import * as policies from "@bobcatt/pulumi-policies";

/**
 * Hre is a quick way to generate a list of all policies
 * ```
 * cd policies
 * grep -r "^export const" ./ | grep -v node_modules/ | grep -v bin/ | grep -v version.ts | sed 's/\// /g; s/://g;' | awk '{printf("policies.%s.%s.%s,\n",$2,$3,$6)}' | sort -du
 * ```
 */

new PolicyPack("policy-pack-bb5ac361-dc16-4bfe-af4f-78b290241862", {
    policies: [
        policies.aws.cloudfront.distributionLoggingEnabled,
        policies.aws.cloudfront.distributionNoUncryptedTraffic,
        policies.aws.cloudfront.distributionOriginSecureTLSConfigured,
        policies.aws.cloudfront.distributionOriginSecureTLSEnabled,
        policies.aws.cloudfront.distributionSecureTLSConfigured,
        policies.aws.cloudfront.distributionWAFConfigured,
        policies.aws.ebs.volumeNoUnencryptedVolume,
        policies.aws.ebs.volumeWithCustomerManagedKey,
        policies.aws.ec2.instanceNoPublicIp,
        policies.aws.ec2.instanceNoUnencryptedBlockDevice,
        policies.aws.ec2.instanceNoUnencryptedRootBlockDevice,
        policies.aws.ec2.launchConfigurationNoPublicIp,
        policies.aws.ec2.launchConfigurationNoUnencryptedBlockDevice,
        policies.aws.ec2.launchConfigurationNoUnencryptedRootBlockDevice,
        policies.aws.ec2.launchTemplateNoPublicIp,
        policies.aws.ec2.launchTemplateNoUnencryptedBlockDevice,
        policies.aws.ec2.securityGroupMissingDescription,
        policies.aws.ec2.securityGroupProhibitInboundHttpTraffic,
        policies.aws.ec2.securityGroupProhibitPublicInternetAccess,
        policies.aws.ecr.repositoryCustomerManagedKey,
        policies.aws.ecr.repositoryImageScans,
        policies.aws.ecr.repositoryImmutableImage,
        policies.aws.ecr.repositoryNoUnencryptedRepository,
        policies.aws.lambda.functionSourceArn,
        policies.aws.lambda.functionTracingEnabled,
        policies.aws.rds.clusterBackupRetention,
        policies.aws.rds.clusterInstancePerformanceInsights,
        policies.aws.rds.clusterInstancePerformanceInsightsEncrypted,
        policies.aws.rds.clusterInstancePublicAccess,
        policies.aws.rds.clusterStorageCustomerManagedKey,
        policies.aws.rds.clusterStorageEncrypted,
        policies.aws.rds.instanceBackupRetention,
        policies.aws.rds.instanceClassicResources,
        policies.aws.rds.instancePerformanceInsights,
        policies.aws.rds.instancePerformanceInsightsEncrypted,
        policies.aws.rds.instancePublicAccess,
        policies.aws.rds.instanceStorageCustomerManagedKey,
        policies.aws.rds.instanceStorageEncrypted,
        policies.aws.s3.bucketNoPublicRead,
        policies.aws.s3.bucketReplicationEnabled,
        policies.aws.s3.bucketServerSideEncryption,
        policies.aws.s3.bucketServerSideEncryptionBucketKey,
        policies.aws.s3.bucketServerSideEncryptionKMS,
        policies.aws.s3.bucketServerSideEncryptionKMSWithCustomerManagedKey,
    ],
});
