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

import { Bucket } from "@pulumi/aws-native/s3";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that S3 Bucket ACLs don't allow 'PublicRead', 'PublicReadWrite' or 'AuthenticatedRead'.
 *
 * @severity critical
 * @frameworks cis, iso27001, pcidss
 * @topics security, storage
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
 */
export const disallowPublicRead: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-s3-bucket-disallow-public-read",
        description: "Checks that S3 Bucket ACLs don't allow 'PublicRead', 'PublicReadWrite' or 'AuthenticatedRead'.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Bucket, (bucket, args, reportViolation) => {
            if (bucket.accessControl) {
                if (
                    bucket.accessControl === "PublicRead" ||
                    bucket.accessControl === "PublicReadWrite" ||
                    bucket.accessControl === "AuthenticatedRead"
                ) {
                    reportViolation("S3 Buckets ACLs should not be set to 'PublicRead', 'PublicReadWrite' or 'AuthenticatedRead'.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "critical",
    topics: ["storage", "security"],
    frameworks: ["cis", "pcidss", "iso27001"],
});
