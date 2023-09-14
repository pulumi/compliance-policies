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

import { Bucket, BucketServerSideEncryptionByDefaultSseAlgorithm } from "@pulumi/aws-native/s3";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Check that S3 Buckets Server-Side Encryption (SSE) is using a customer-managed KMS Key.
 *
 * @severity low
 * @frameworks iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/specifying-kms-encryption.html
 */
export const configureServerSideEncryptionCustomerManagedKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-s3-bucket-configure-server-side-encryption-customer-managed-key",
        description: "Check that S3 Buckets Server-Side Encryption (SSE) is using a customer-managed KMS Key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Bucket, (bucket, args, reportViolation) => {
            if (bucket.bucketEncryption && bucket.bucketEncryption.serverSideEncryptionConfiguration) {
                bucket.bucketEncryption.serverSideEncryptionConfiguration.forEach((serverSideEncryptionConfiguration) => {
                    if (
                        serverSideEncryptionConfiguration.serverSideEncryptionByDefault &&
                        serverSideEncryptionConfiguration.serverSideEncryptionByDefault.sseAlgorithm === BucketServerSideEncryptionByDefaultSseAlgorithm.Awskms &&
                        !serverSideEncryptionConfiguration.serverSideEncryptionByDefault.kmsMasterKeyId
                    ) {
                        reportViolation("S3 Buckets Server-Side Encryption (SSE) should use a Customer-managed KMS key.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["s3"],
    severity: "low",
    topics: ["encryption", "storage"],
    frameworks: ["pcidss", "iso27001"],
});
