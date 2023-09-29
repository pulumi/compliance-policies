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

import { AccountPasswordPolicy } from "@pulumi/aws/iam";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Ensure IAM password policy requires minimum length of 14 or greater.
 *
 * @severity high
 * @frameworks cis
 * @topics container, vulnerability
 * @link https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_passwords_account-policy.html
 */
export const minimumPasswordLength: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-iam-password-policy-minimum-password-length",
        description: "Ensure IAM password policy requires minimum length of 14 or greater.",
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(AccountPasswordPolicy, (policy, args, reportViolation) => {
            if (!policy.minimumPasswordLength || policy.minimumPasswordLength < 14) {
                reportViolation("Passwords should be minimal 14 characters long.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["iam"],
    severity: "high",
    topics: ["vulnerability"],
    frameworks: ["cis"],
});
