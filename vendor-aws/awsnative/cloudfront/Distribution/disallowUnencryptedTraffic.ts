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
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that CloudFront distributions only allow encypted ingress traffic.
 *
 * @severity Critical
 * @link https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
 */
export const disallowUnencryptedTraffic: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-cloudfront-distribution-disallow-unencrypted-traffic",
        description: "Checks that CloudFront distributions only allow encypted ingress traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.cloudfront.Distribution, (distribution, args, reportViolation) => {
            if (distribution.distributionConfig.defaultCacheBehavior.viewerProtocolPolicy.toLowerCase() === "allow-all") {
                reportViolation("CloudFront distributions should not allow unencrypted traffic.");
            }
            if (distribution.distributionConfig.cacheBehaviors) {
                if (distribution.distributionConfig.cacheBehaviors.some(cacheBehaviors => cacheBehaviors.viewerProtocolPolicy.toLowerCase() === "allow-all")) {
                    reportViolation("CloudFront distributions should not allow unencrypted traffic.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["cloudfront"],
    severity: "critical",
    topics: ["network"],
});
