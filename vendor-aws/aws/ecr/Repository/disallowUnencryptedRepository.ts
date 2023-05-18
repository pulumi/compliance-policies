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
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that ECR Repositories are encrypted.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics container, encryption, storage
 * @link https://docs.aws.amazon.com/AmazonECR/latest/userguide/encryption-at-rest.html
 */
export const disallowUnencryptedRepository: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ecr-repository-disallow-unencrypted-repository",
        description: "Checks that ECR Repositories are encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ecr.Repository, (repo, args, reportViolation) => {
            if (repo.encryptionConfigurations === undefined) {
                reportViolation("ECR repositories should be encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["ecr"],
    severity: "high",
    topics: ["container", "encryption", "storage"],
    frameworks: ["pcidss", "iso27001"],
});
