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

import * as awsnative from "@pulumi/aws-native";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that CloudFront distributions communicate with custom origins using TLS 1.2 encryption only.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics encryption, network
 * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-s3-origin.html
 */
export const configureSecureTlsToOrigin: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-cloudfront-distribution-configure-secure-tls-to-origin",
        description: "Checks that CloudFront distributions communicate with custom origins using TLS 1.2 encryption only.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.cloudfront.Distribution, (distribution, args, reportViolation) => {
            distribution.distributionConfig.origins?.forEach((origin) => {
                origin.customOriginConfig?.originSSLProtocols?.forEach((sslProtocol) => {
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
    frameworks: ["pcidss", "iso27001"],
});
