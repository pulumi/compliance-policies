import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";
import * as policies from "@bobcatt/pulumi-policies";

/**
 * Hre is a quick way to generate a list of all policies
 * ```
 * cd policies
 * grep -r "^export const" ./aws | grep -v node_modules/ | grep -v bin/ | grep -v version.ts | sed 's/\// /g; s/:/ /g; s/\\.ts//g;' | awk '{printf("policies.%s.%s.%s.%s,\n",$2,$3,$4,$7)}' | sort -du
 * grep -r "^export const" ./kubernetes/ | grep -v node_modules/ | grep -v bin/ | grep -v version.ts | sed 's/\// /g; s/:/ /g; s/\.ts//g;' | awk '{printf("policies.%s.%s.%s.%s.%s,\n",$2,$3,$4,$5,$8)}' | sort -du
 * ```
 */

new PolicyPack("policy-pack-bb5ac361-dc16-4bfe-af4f-78b290241862", {
    policies: [
        policies.aws.cloudfront.distribution.LoggingEnabled,
        policies.aws.cloudfront.distribution.noUncryptedTraffic,
        policies.aws.cloudfront.distribution.originSecureTLSConfigured,
        policies.aws.cloudfront.distribution.originSecureTLSEnabled,
        policies.aws.cloudfront.distribution.secureTLSConfigured,
        policies.aws.cloudfront.distribution.wafConfigured,
        policies.aws.ebs.volume.customerManagedKey,
        policies.aws.ebs.volume.noUnencryptedVolume,
        policies.aws.ec2.instance.noPublicIp,
        policies.aws.ec2.instance.noUnencryptedBlockDevice,
        policies.aws.ec2.instance.noUnencryptedRootBlockDevice,
        policies.aws.ec2.launchConfiguration.noPublicIp,
        policies.aws.ec2.launchConfiguration.noUnencryptedBlockDevice,
        policies.aws.ec2.launchConfiguration.noUnencryptedRootBlockDevice,
        policies.aws.ec2.launchTemplate.noPublicIp,
        policies.aws.ec2.launchTemplate.noUnencryptedBlockDevice,
        policies.aws.ec2.securityGroup.missingDescription,
        policies.aws.ec2.securityGroup.prohibitInboundHttpTraffic,
        policies.aws.ec2.securityGroup.prohibitPublicInternetAccess,
        policies.aws.ecr.repository.customerManagedKey,
        policies.aws.ecr.repository.imageScans,
        policies.aws.ecr.repository.immutableImage,
        policies.aws.ecr.repository.noUnencryptedRepository,
        policies.aws.lambda.function.tracingEnabled,
        policies.aws.lambda.permission.sourceArn,
        policies.aws.rds.cluster.backupRetention,
        policies.aws.rds.clusterInstance.performanceInsights,
        policies.aws.rds.clusterInstance.performanceInsightsEncrypted,
        policies.aws.rds.clusterInstance.publicAccess,
        policies.aws.rds.cluster.storageCustomerManagedKey,
        policies.aws.rds.cluster.storageEncrypted,
        policies.aws.rds.instance.BackupRetention,
        policies.aws.rds.instance.ClassicResources,
        policies.aws.rds.instance.performanceInsights,
        policies.aws.rds.instance.performanceInsightsEncrypted,
        policies.aws.rds.instance.publicAccess,
        policies.aws.rds.instance.storageCustomerManagedKey,
        policies.aws.rds.instance.storageEncrypted,
        policies.aws.s3.bucket.noPublicRead,
        policies.aws.s3.bucket.replicationEnabled,
        policies.aws.s3.bucket.serverSideEncryption,
        policies.aws.s3.bucket.serverSideEncryptionBucketKey,
        policies.aws.s3.bucket.serverSideEncryptionKMS,
        policies.aws.s3.bucket.serverSideEncryptionKMSWithCustomerManagedKey,
        policies.kubernetes.apps.v1.deployment.minimumReplicaCount,
        policies.kubernetes.apps.v1.deployment.recommendedLabel,
        policies.kubernetes.apps.v1.replicaSet.minimumReplicaCount,
        policies.kubernetes.apps.v1.replicaSet.recommendedLabel,
        policies.kubernetes.core.v1.pod.prohibitPod,
        policies.kubernetes.core.v1.service.recommendedLabel,
    ],
});
