// Copyright 2016-2023, Pulumi Corporation.
//
// Permission is hereby granted to use the Software for the duration
// of your contract with Pulumi Corporation under the following terms and
// conditions.
//
//       https://www.pulumi.com/terms-and-conditions/
//
// By using the Software, you agree not to copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, even after the
// termination of your contract with us.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as aws from "@pulumi/aws";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that any CloudFront distributions have access logging enabled.
 *
 * @severity Medium
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html
 */
export const enableAccessLogging: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-enable-access-logging",
        description: "Checks that any CloudFront distributions have access logging enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.cloudfront.Distribution, (distribution, args, reportViolation) => {
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
 * @severity Medium
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html
 */
export const configureAccessLogging: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-configure-access-logging",
        description: "Checks that any CloudFront distributions have access logging configured.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.cloudfront.Distribution, (distribution, args, reportViolation) => {
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
 * @severity High
 * @link https://docs.aws.amazon.com/waf/latest/developerguide/cloudfront-features.html
 */
export const configureWaf: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-configure-waf",
        description: "Checks that any CloudFront distribution has a WAF ACL associated.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.cloudfront.Distribution, (distribution, args, reportViolation) => {
            if (!distribution.webAclId) {
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
 * @severity Critical
 * @link https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
 */
export const disallowUnencryptedTraffic: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-disallow-unencrypted-traffic",
        description: "Checks that CloudFront distributions only allow encypted ingress traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.cloudfront.Distribution, (distribution, args, reportViolation) => {
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
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html
 */
export const configureSecureTls: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-configure-secure-tls",
        description: "Checks that CloudFront distributions uses secure/modern TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.cloudfront.Distribution, (distribution, args, reportViolation) => {
            if (!distribution.viewerCertificate.minimumProtocolVersion || distribution.viewerCertificate.minimumProtocolVersion.toLowerCase() !== "TLSv1.2_2021".toLowerCase()) {
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
 * @severity Critical
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-s3-origin.html
 */
export const enableTlsToOrigin: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-enable-tls-to-origin",
        description: "Checks that CloudFront distributions communicate with custom origins using TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.cloudfront.Distribution, (distribution, args, reportViolation) => {
            distribution.origins.forEach((origin) => {
                if (origin.customOriginConfig && origin.customOriginConfig.originProtocolPolicy.toLowerCase() !== "https-only") {
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
 * @severity High
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-s3-origin.html
 */
export const configureSecureTlsToOrigin: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-cloudfront-distribution-configure-secure-tls-to-origin",
        description: "Checks that CloudFront distributions communicate with custom origins using TLS 1.2 encryption only.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.cloudfront.Distribution, (distribution, args, reportViolation) => {
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
