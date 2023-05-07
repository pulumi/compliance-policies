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
 * Checks that KMS Keys do not bypass the key policy lockout safety check.
 *
 * @severity critical
 * @frameworks none
 * @topics encryption
 * @link https://docs.aws.amazon.com/kms/latest/developerguide/conditions-kms.html#conditions-kms-bypass-policy-lockout-safety-check
 */
export const disallowBypassPolicyLockoutSafetyCheck: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-kms-key-disallow-bypass-policy-lockout-safety-check",
        description: "Checks that KMS Keys do not bypass the key policy lockout safety check.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.kms.Key, (key, args, reportViolation) => {
            if (key.bypassPolicyLockoutSafetyCheck) {
                reportViolation("KMS Keys should not bypass the key policy lockout safety check.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["kms"],
    severity: "critical",
    topics: ["encryption"],
});
