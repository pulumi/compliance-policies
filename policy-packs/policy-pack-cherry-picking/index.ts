import * as aws from "@pulumi/aws";
import { PolicyPack } from "@pulumi/policy";
import * as policies from "@bobcatt/pulumi-policies";

/**
 * You may quickly generate the list below using the following command
 *
 * ```
 * find ./aws ./kubernetes -name "*.ts" | grep -v index.ts | sort | while read F; do
 *   N=$(echo "$F" | sed 's/\(.*\/\)\(\w\)\(.*\)\.ts/\1\U\2\E\3/g; s/^\./policies/g; s/\//./g;')
 *   grep "export const" $F | awk '{print $3}' | sed 's/:$/,/' | while read P; do
 *       echo "${N}.${P}"
 *   done
 * done
 * ```
 * ```
 * find ./aws ./kubernetes -name "*.ts" | grep -v index.ts | sort | while read F; do N=$(echo "$F" | sed 's/\(.*\/\)\(\w\)\(.*\)\.ts/\1\U\2\E\3/g; s/^\./policies/g; s/\//./g;'); grep "export const" $F | awk '{print $3}' | sed 's/:$/,/' | while read P; do echo "${N}.${P}";  done; done
 * ```
 */

new PolicyPack("policy-pack-acme-corp-cherry-picking", {
    policies: [
        policies.aws.apigatewayv2.DomainName.enableDomainNameConfiguration,
        policies.aws.apigatewayv2.DomainName.configureDomainNameSecurityPolicy,
        policies.aws.apigatewayv2.Stage.enableAccessLogging,
        policies.aws.apigatewayv2.Stage.configureAccessLogging,
        policies.aws.cloudfront.Distribution.enableAccessLogging,
        policies.aws.cloudfront.Distribution.configureAccessLogging,
        policies.aws.cloudfront.Distribution.configureWaf,
        policies.aws.cloudfront.Distribution.disallowUnencryptedTraffic,
        policies.aws.cloudfront.Distribution.configureSecureTLS,
        policies.aws.cloudfront.Distribution.enableTLSToOrigin,
        policies.aws.cloudfront.Distribution.configureSedureTLSToOrgin,
        policies.aws.ebs.Volume.disallowUnencryptedVolume,
        policies.aws.ebs.Volume.configureCustomerManagedKey,
        policies.aws.ec2.Instance.disallowPublicIP,
        policies.aws.ec2.Instance.disallowUnencryptedRootBlockDevice,
        policies.aws.ec2.Instance.disallowUnencryptedBlockDevice,
        policies.aws.ec2.LaunchConfiguration.disallowPublicIP,
        policies.aws.ec2.LaunchConfiguration.disallowUnencryptedRootBlockDevice,
        policies.aws.ec2.LaunchConfiguration.disallowUnencryptedBlockDevice,
        policies.aws.ec2.LaunchTemplate.disallowPublicIP,
        policies.aws.ec2.LaunchTemplate.disallowUnencryptedBlockDevice,
        policies.aws.ec2.SecurityGroup.missingDescription,
        policies.aws.ec2.SecurityGroup.disallowInboundHttpTraffic,
        policies.aws.ec2.SecurityGroup.disallowPublicInternetIngress,
        policies.aws.ecr.Repository.configureImageScan,
        policies.aws.ecr.Repository.enableImageScan,
        policies.aws.ecr.Repository.disallowMutableImage,
        policies.aws.ecr.Repository.disallowUnencryptedRepository,
        policies.aws.ecr.Repository.configureCustomerManagedKey,
        policies.aws.eks.Cluster.enableClusterEncryptionConfig,
        policies.aws.eks.Cluster.disallowAPIEndpointPublicAccess,
        policies.aws.elb.LoadBalancer.disallowInboundHttpTraffic,
        policies.aws.elb.LoadBalancer.configureMultiAvailabilityZone,
        policies.aws.elb.LoadBalancer.configureAccessLogging,
        policies.aws.lambda.Function.enableTracingConfig,
        policies.aws.lambda.Function.configureTracingConfig,
        policies.aws.lambda.Permission.configureSourceArn,
        policies.aws.rds.ClusterInstance.enablePerformanceInsights,
        policies.aws.rds.ClusterInstance.disallowUnencryptedPerformanceInsights,
        policies.aws.rds.ClusterInstance.disallowPublicAccess,
        policies.aws.rds.Cluster.enableBackupRetention,
        policies.aws.rds.Cluster.configureBackupRetention,
        policies.aws.rds.Cluster.disallowUnencryptedStorage,
        policies.aws.rds.Cluster.configureCustomerManagedKey,
        policies.aws.rds.Instance.enableBackupRetention,
        policies.aws.rds.Instance.configureBackupRetention,
        policies.aws.rds.Instance.disallowClassicResources,
        policies.aws.rds.Instance.enablePerformanceInsights,
        policies.aws.rds.Instance.disallowUnencryptedPerformanceInsights,
        policies.aws.rds.Instance.disallowPublicAccess,
        policies.aws.rds.Instance.disallowUnencryptedStorage,
        policies.aws.rds.Instance.configureCustomerManagedKey,
        policies.aws.s3.Bucket.disallowPublicRead,
        policies.aws.s3.Bucket.enableReplicationConfiguration,
        policies.aws.s3.Bucket.configureReplicationConfiguration,
        policies.aws.s3.Bucket.enableServerSideEncryption,
        policies.aws.s3.Bucket.configureServerSideEncryptionKMS,
        policies.aws.s3.Bucket.configureServerSideEncryptionCustomerManagedKey,
        policies.aws.s3.Bucket.enableServerSideEncryptionBucketKey,
        policies.kubernetes.apps.v1.Deployment.configureMinimumReplicaCount,
        policies.kubernetes.apps.v1.Deployment.configureRecommendedLabel,
        policies.kubernetes.apps.v1.ReplicaSet.configureMinimumReplicaCount,
        policies.kubernetes.apps.v1.ReplicaSet.configureRecommendedLabel,
        policies.kubernetes.core.v1.Pod.disallowPod,
        policies.kubernetes.core.v1.Service.configureRecommendedLabel,
    ],
});
