// Copyright 2016-2024, Pulumi Corporation.
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

import * as awsnative from "@pulumi/aws-native";
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../../enums";
import { createResourceValidationArgs } from "@pulumi/compliance-policies-unit-test-helpers";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(awsnative.cloudfront.Distribution, {
        distributionConfig: {
            enabled: true,
            logging: {
                bucket: enums.s3.bucketRegionalDomainName,
                includeCookies: false,
                prefix: "/",
            },
            origins: [{
                domainName: enums.s3.bucketRegionalDomainName,
                id: enums.cloudfront.originId,
            },{
                domainName: "www.example.com",
                id: "test-ddlwJDFEJeweDdwki-example",
                customOriginConfig: {
                    httpPort: 80,
                    httpsPort: 443,
                    originProtocolPolicy: "https-only",
                    originSslProtocols: ["TLSv1.2"],
                },
            }],
            defaultCacheBehavior: {
                targetOriginId: enums.cloudfront.originId,
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
            cacheBehaviors: [{
                pathPattern: "/*",
                allowedMethods: [
                    "GET",
                    "HEAD",
                ],
                cachedMethods: [
                    "GET",
                    "HEAD",
                ],
                targetOriginId: enums.cloudfront.originId,
                forwardedValues: {
                    queryString: false,
                    headers: ["Origin"],
                    cookies: {
                        forward: "none",
                    },
                },
                defaultTtl: 60,
                minTtl: 0,
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
                acmCertificateArn: enums.acm.certificateArn,
                minimumProtocolVersion: "TLSv1.2_2021",
                sslSupportMethod: "sni-only",
            },
            webAclId: enums.waf.webAclArn,
        },
    });
}
