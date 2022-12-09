"use strict";
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
exports.__esModule = true;
exports.configureSedureTLSToOrgin = exports.enableTLSToOrigin = exports.configureSecureTLS = exports.disallowUnencryptedTraffic = exports.configureWaf = exports.configureAccessLogging = exports.enableAccessLogging = void 0;
var awsnative = require("@pulumi/aws-native");
var policy_1 = require("@pulumi/policy");
var utils_1 = require("../../utils");
/**
 * Checks that any CloudFront distributions have access logging enabled.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html
 */
exports.enableAccessLogging = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-cloudfront-distribution-enable-access-logging",
        description: "Checks that any CloudFront distributions have access logging enabled.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.cloudfront.Distribution, function (distribution, args, reportViolation) {
            if (!distribution.distributionConfig.logging) {
                reportViolation("CloudFront Distributions should have logging enabled.");
            }
        })
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "medium",
    topics: ["network", "logging"]
});
/**
 * Checks that any CloudFront distributions have access logging configured.
 *
 * @severity **Medium**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html
 */
exports.configureAccessLogging = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-cloudfront-distribution-configure-access-logging",
        description: "Checks that any CloudFront distributions have access logging configured.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.cloudfront.Distribution, function (distribution, args, reportViolation) {
            if (distribution.distributionConfig.logging && !distribution.distributionConfig.logging.bucket) {
                reportViolation("CloudFront Distributions should have access logging configured.");
            }
        })
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "medium",
    topics: ["network", "logging"]
});
/**
 * Checks that any CloudFront distribution has a WAF ACL associated.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/waf/latest/developerguide/cloudfront-features.html
 */
exports.configureWaf = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-cloudfront-distribution-configure-waf-acl",
        description: "Checks that any CloudFront distribution has a WAF ACL associated.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.cloudfront.Distribution, function (distribution, args, reportViolation) {
            if (distribution.distributionConfig.webACLId === undefined) {
                reportViolation("CloudFront Distributions should have a WAF ACL associated.");
            }
        })
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "high",
    topics: ["network"]
});
/**
 * Checks that CloudFront distributions only allow encypted ingress traffic.
 *
 * @severity **Critical**
 * @link https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
 */
exports.disallowUnencryptedTraffic = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-cloudfront-distribution-disallow-unencrypted-traffic",
        description: "Checks that CloudFront distributions only allow encypted ingress traffic.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.cloudfront.Distribution, function (distribution, args, reportViolation) {
            var _a;
            if (distribution.distributionConfig.defaultCacheBehavior.viewerProtocolPolicy.toLowerCase() === "allow-all") {
                reportViolation("CloudFront distributions should not allow unencrypted traffic.");
            }
            if ((_a = distribution.distributionConfig.cacheBehaviors) === null || _a === void 0 ? void 0 : _a.some(function (cacheBehaviors) { return cacheBehaviors.viewerProtocolPolicy.toLowerCase() === "allow-all"; })) {
                reportViolation("CloudFront distributions should not allow unencrypted traffic.");
            }
        })
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "critical",
    topics: ["network"]
});
/**
 * Checks that CloudFront distributions uses secure/modern TLS encryption.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html
 */
exports.configureSecureTLS = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-cloudfront-distribution-configure-secure-tls",
        description: "Checks that CloudFront distributions uses secure/modern TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.cloudfront.Distribution, function (distribution, args, reportViolation) {
            var _a;
            if (distribution.distributionConfig.viewerCertificate && ((_a = distribution.distributionConfig.viewerCertificate.minimumProtocolVersion) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== "TLSv1.2_2021".toLowerCase()) {
                reportViolation("CloudFront distributions should use secure/modern TLS encryption.");
            }
        })
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "high",
    topics: ["network", "encryption"]
});
/**
 * Checks that CloudFront distributions communicate with custom origins using TLS encryption.
 *
 * @severity **Critical**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-s3-origin.html
 */
exports.enableTLSToOrigin = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-cloudfront-distribution-enable-tls-to-origin",
        description: "Checks that CloudFront distributions communicate with custom origins using TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.cloudfront.Distribution, function (distribution, args, reportViolation) {
            var _a;
            (_a = distribution.distributionConfig.origins) === null || _a === void 0 ? void 0 : _a.forEach(function (origin) {
                if (origin.customOriginConfig && origin.customOriginConfig.originProtocolPolicy.toLowerCase() !== "https-only") {
                    reportViolation("CloudFront Distributions should use TLS encryption to communicate with custom origins.");
                }
            });
        })
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "critical",
    topics: ["network", "encryption"]
});
/**
 * Checks that CloudFront distributions communicate with custom origins using TLS 1.2 encryption only.
 *
 * @severity **High**
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-s3-origin.html
 */
exports.configureSedureTLSToOrgin = utils_1.policyRegistrations.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-native-cloudfront-distribution-configure-secure-tls-to-origin",
        description: "Checks that CloudFront distributions communicate with custom origins using TLS 1.2 encryption only.",
        enforcementLevel: "advisory",
        validateResource: (0, policy_1.validateResourceOfType)(awsnative.cloudfront.Distribution, function (distribution, args, reportViolation) {
            var _a;
            (_a = distribution.distributionConfig.origins) === null || _a === void 0 ? void 0 : _a.forEach(function (origin) {
                var _a, _b;
                (_b = (_a = origin.customOriginConfig) === null || _a === void 0 ? void 0 : _a.originSSLProtocols) === null || _b === void 0 ? void 0 : _b.forEach(function (sslProtocol) {
                    if (sslProtocol.toLowerCase() !== "TLSv1.2".toLowerCase()) {
                        reportViolation("CloudFront Distributions should only use TLS 1.2 encryption to communicate with custom origins.");
                    }
                });
            });
        })
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "high",
    topics: ["network", "encryption"]
});
