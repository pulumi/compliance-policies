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
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that Secrets Manager Secrets have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html
 */
export const missingDescription: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-secretsmanager-secret-missing-description",
        description: "Checks that Secrets Manager Secrets have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.secretsmanager.Secret, (secret, args, reportViolation) => {
            if (!secret.description) {
                reportViolation("Secrets Manager Secrets should have a description.");
            } else {
                if (secret.description.length < 6 ) {
                    reportViolation("Secrets Manager Secrets should have a meaningful description.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["secretsmanager"],
    severity: "low",
    topics: ["documentation"],
});

/**
 * Check that Secrets Manager Secrets use a customer-manager KMS key.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html
 */
export const configureCustomerManagedKey: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-secretsmanager-secret-configure-customer-managed-key",
        description: "Check that Secrets Manager Secrets use a customer-manager KMS key.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.secretsmanager.Secret, (secret, args, reportViolation) => {
            if (!secret.kmsKeyId) {
                reportViolation("Secrets Manager Secrets should be encrypted using a customer-managed KMS key.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["secretsmanager"],
    severity: "low",
    topics: ["encryption"],
});
