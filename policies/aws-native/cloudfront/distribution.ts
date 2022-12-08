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

import * as awsNative from "@pulumi/aws-native";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyRegistrations } from "../../utils";

/**
 * Checks that any CloudFront distributions have access logging enabled.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html
 */
export const enableAccessLogging: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-cloudfront-distribution-enable-access-logging",
        description: "Checks that any CloudFront distributions have access logging enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.cloudfront.Distribution, (distribution, args, reportViolation) => {
            if (!distribution.loggingConfig) {
                reportViolation("CloudFront Distributions should have logging enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "medium",
    topics: ["network", "logging"],
});

/**
 * Checks that any CloudFront distributions have access logging configured.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html
 */
export const configureAccessLogging: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-cloudfront-distribution-configure-access-logging",
        description: "Checks that any CloudFront distributions have access logging configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.cloudfront.Distribution, (distribution, args, reportViolation) => {
            if (distribution.loggingConfig && !distribution.loggingConfig.bucket) {
                reportViolation("CloudFront Distributions should have access logging configured.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "medium",
    topics: ["network", "logging"],
});

/**
 * Checks that any CloudFront distribution has a WAF ACL associated.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/waf/latest/developerguide/cloudfront-features.html
 */
export const configureWaf: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-cloudfront-distribution-configure-waf-acl",
        description: "Checks that any CloudFront distribution has a WAF ACL associated.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.cloudfront.Distribution, (distribution, args, reportViolation) => {
            if (distribution.webAclId === undefined) {
                reportViolation("CloudFront Distributions should have a WAF ACL associated.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "high",
    topics: ["network"],
});

/**
 * Checks that CloudFront distributions only allow encypted ingress traffic.
 *
 * @severity **Critical**
 * @link https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
 */
export const disallowUnencryptedTraffic: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-cloudfront-distribution-disallow-unencrypted-traffic",
        description: "Checks that CloudFront distributions only allow encypted ingress traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.cloudfront.Distribution, (distribution, args, reportViolation) => {
            if (distribution.defaultCacheBehavior.viewerProtocolPolicy.toLowerCase() === "allow-all") {
                reportViolation("CloudFront distributions should not allow unencrypted traffic.");
            }
            if (distribution.orderedCacheBehaviors?.some(orderedCacheBehavior => orderedCacheBehavior.viewerProtocolPolicy.toLowerCase() === "allow-all")) {
                reportViolation("CloudFront distributions should not allow unencrypted traffic.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "critical",
    topics: ["network"],
});

/**
 * Checks that CloudFront distributions uses secure/modern TLS encryption.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html
 */
export const configureSecureTLS: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-cloudfront-distribution-configure-secure-tls",
        description: "Checks that CloudFront distributions uses secure/modern TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.cloudfront.Distribution, (distribution, args, reportViolation) => {
            if ( distribution.viewerCertificate.minimumProtocolVersion?.toLowerCase() !== "TLSv1.2_2021".toLowerCase()) {
                reportViolation("CloudFront distributions should use secure/modern TLS encryption.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "high",
    topics: ["network", "encryption"],
});

/**
 * Checks that CloudFront distributions communicate with custom origins using TLS encryption.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-s3-origin.html
 */
export const enableTLSToOrigin: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-cloudfront-distribution-enable-tls-to-origin",
        description: "Checks that CloudFront distributions communicate with custom origins using TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.cloudfront.Distribution, (distribution, args, reportViolation) => {
            distribution.origins.forEach((origin) => {
                if (origin.customOriginConfig?.originProtocolPolicy.toLowerCase() !== "https-only") {
                    reportViolation("CloudFront Distributions should use TLS encryption to communicate with custom origins.");
                }
            });
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "critical",
    topics: ["network", "encryption"],
});

/**
 * Checks that CloudFront distributions communicate with custom origins using TLS 1.2 encryption only.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-s3-origin.html
 */
export const configureSedureTLSToOrgin: ResourceValidationPolicy = policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws_native-cloudfront-distribution-configure-secure-tls-to-origin",
        description: "Checks that CloudFront distributions communicate with custom origins using TLS 1.2 encryption only.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws_native.cloudfront.Distribution, (distribution, args, reportViolation) => {
            distribution.origins.forEach((origin) => {
                origin.customOriginConfig?.originSslProtocols?.forEach((sslProtocol) => {
                    if (sslProtocol.toLowerCase() !== "TLSv1.2".toLowerCase()) {
                        reportViolation("CloudFront Distributions should only use TLS 1.2 encryption to communicate with custom origins.");
                    }
                });
            });
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "high",
    topics: ["network", "encryption"],
});
