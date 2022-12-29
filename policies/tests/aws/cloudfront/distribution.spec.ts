// Copyright 2016-2023, Pulumi Corporation.
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

import "mocha";
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, createResourceValidationArgs, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription } from "../../utils";
import * as aws from "@pulumi/aws";

import * as policies from "../../../index";
import { ResourceValidationArgs } from "@pulumi/policy";
import { acm, cloudfront, s3, waf } from "../enums";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.cloudfront.Distribution, {
        enabled: true,
        loggingConfig: {
            includeCookies: false,
            bucket: s3.bucketRegionalDomainName,
            prefix: "/",
        },
        origins: [{
            domainName: s3.bucketRegionalDomainName,
            originId: cloudfront.originId,
        },{
            domainName: "www.example.com",
            originId: "test-ddlwJDFEJeweDdwki-example",
            customOriginConfig: {
                httpPort: 80,
                httpsPort: 443,
                originProtocolPolicy: "https-only",
                originSslProtocols: ["TLSv1.2"],
            },
        }],
        defaultCacheBehavior: {
            targetOriginId: cloudfront.originId,
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: [
                "GET",
                "HEAD",
                "OPTIONS",
            ],
            cachedMethods: [
                "GET",
                "HEAD",
                "OPTIONS",
            ],
            defaultTtl: 600,
            maxTtl: 600,
            minTtl: 600,
            forwardedValues: {
                queryString: true,
                cookies: {
                    forward: "all",
                },
            },
        },
        orderedCacheBehaviors: [{
            pathPattern: "/*",
            allowedMethods: [
                "GET",
                "HEAD",
            ],
            cachedMethods: [
                "GET",
                "HEAD",
            ],
            targetOriginId: cloudfront.originId,
            forwardedValues: {
                queryString: false,
                headers: ["Origin"],
                cookies: {
                    forward: "none",
                },
            },
            minTtl: 0,
            defaultTtl: 60,
            maxTtl: 60,
            compress: true,
            viewerProtocolPolicy: "redirect-to-https",
        }],
        defaultRootObject: "index.html",
        priceClass: "PriceClass_100",
        customErrorResponses: [{
            errorCode: 404,
            responseCode: 404,
            responsePagePath: `/error.html`,
        }],
        restrictions: {
            geoRestriction: {
                restrictionType: "none",
            },
        },
        viewerCertificate: {
            acmCertificateArn: acm.certificateArn,
            minimumProtocolVersion: "TLSv1.2_2021",
            sslSupportMethod: "sni-only",
        },
        webAclId: waf.webAclArn,
    });
}

describe("aws.cloudfront.Distribution.enableAccessLogging", function() {
    const policy = policies.aws.cloudfront.Distribution.enableAccessLogging;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-cloudfront-distribution-enable-access-logging");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["cloudfront"],
            severity: "medium",
            topics: ["network", "logging"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.loggingConfig = undefined;
        await assertHasResourceViolation(policy, args, { message: "CloudFront Distributions should have logging enabled." });
    });
});

describe("aws.cloudfront.Distribution.configureAccessLogging", function() {
    const policy = policies.aws.cloudfront.Distribution.configureAccessLogging;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-cloudfront-distribution-configure-access-logging");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["cloudfront"],
            severity: "medium",
            topics: ["network", "logging"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.loggingConfig.bucket = "";
        await assertHasResourceViolation(policy, args, { message: "CloudFront Distributions should have access logging configured." });
    });
});

describe("aws.cloudfront.Distribution.configureWaf", function() {
    const policy = policies.aws.cloudfront.Distribution.configureWaf;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-cloudfront-distribution-configure-waf");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["cloudfront"],
            severity: "high",
            topics: ["network"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.webAclId = "";
        await assertHasResourceViolation(policy, args, { message: "CloudFront Distributions should have a WAF ACL associated." });
    });
});

describe("aws.cloudfront.Distribution.disallowUnencryptedTraffic", function() {
    const policy = policies.aws.cloudfront.Distribution.disallowUnencryptedTraffic;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-cloudfront-distribution-disallow-unencrypted-traffic");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["cloudfront"],
            severity: "critical",
            topics: ["network"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.defaultCacheBehavior.viewerProtocolPolicy = "allow-all";
        await assertHasResourceViolation(policy, args, { message: "CloudFront distributions should not allow unencrypted traffic." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.orderedCacheBehaviors[0].viewerProtocolPolicy = "allow-all";
        await assertHasResourceViolation(policy, args, { message: "CloudFront distributions should not allow unencrypted traffic." });
    });

});

describe("aws.cloudfront.Distribution.configureSecureTLS", function() {
    const policy = policies.aws.cloudfront.Distribution.configureSecureTLS;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-cloudfront-distribution-configure-secure-tls");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["cloudfront"],
            severity: "high",
            topics: ["network", "encryption"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.viewerCertificate.minimumProtocolVersion = "";
        await assertHasResourceViolation(policy, args, { message: "CloudFront distributions should use secure/modern TLS encryption." });
    });
});

describe("aws.cloudfront.Distribution.enableTLSToOrigin", function() {
    const policy = policies.aws.cloudfront.Distribution.enableTLSToOrigin;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-cloudfront-distribution-enable-tls-to-origin");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["cloudfront"],
            severity: "critical",
            topics: ["network", "encryption"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.origins[1].customOriginConfig.originProtocolPolicy = "";
        await assertHasResourceViolation(policy, args, { message: "CloudFront Distributions should use TLS encryption to communicate with custom origins." });
    });
});

describe("aws.cloudfront.Distribution.configureSecureTLSToOrgin", function() {
    const policy = policies.aws.cloudfront.Distribution.configureSecureTLSToOrgin;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-cloudfront-distribution-configure-secure-tls-to-origin");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["cloudfront"],
            severity: "high",
            topics: ["network", "encryption"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.origins[1].customOriginConfig.originSslProtocols = ["TLSv1.2", "TLSv1"];
        await assertHasResourceViolation(policy, args, { message: "CloudFront Distributions should only use TLS 1.2 encryption to communicate with custom origins." });
    });
});
