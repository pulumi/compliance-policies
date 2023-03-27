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
import { ResourceValidationArgs } from "@pulumi/policy";
import * as enums from "../../enums";
import { createResourceValidationArgs } from "@pulumi-premium-policies/unit-test-helpers";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(aws.cloudfront.Distribution, {
        enabled: true,
        loggingConfig: {
            includeCookies: false,
            bucket: enums.s3.bucketRegionalDomainName,
            prefix: "/",
        },
        origins: [{
            domainName: enums.s3.bucketRegionalDomainName,
            originId: enums.cloudfront.originId,
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
            targetOriginId: enums.cloudfront.originId,
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
            acmCertificateArn: enums.acm.certificateArn,
            minimumProtocolVersion: "TLSv1.2_2021",
            sslSupportMethod: "sni-only",
        },
        webAclId: enums.waf.webAclArn,
    });
}
