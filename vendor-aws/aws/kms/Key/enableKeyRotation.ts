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

import { Key } from "@pulumi/aws/kms";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Checks that KMS Keys have key rotation enabled.
 *
 * @severity medium
 * @frameworks iso27001, pcidss
 * @topics encryption
 * @link https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html
 */
export const enableKeyRotation: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-kms-key-enable-key-rotation",
        description: "Checks that KMS Keys have key rotation enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Key, (key, args, reportViolation) => {
            if (!key.enableKeyRotation) {
                reportViolation("KMS Keys should have key rotation enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["kms"],
    severity: "medium",
    topics: ["encryption"],
    frameworks: ["pcidss", "iso27001"],
});
