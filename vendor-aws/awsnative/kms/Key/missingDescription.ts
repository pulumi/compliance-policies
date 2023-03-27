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
 * Checks that KMS Keys have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html
 * https://docs.aws.amazon.com/kms/latest/APIReference/API_DescribeKey.html
 */
export const missingDescription: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "awsnative-kms-key-missing-description",
        description: "Checks that KMS Keys have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(awsnative.kms.Key, (key, args, reportViolation) => {
            if (!key.description) {
                reportViolation("KMS Keys should have a description.");
            } else {
                if (key.description.length < 6 ) {
                    reportViolation("KMS Keys should have a meaningful description.");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["kms"],
    severity: "low",
    topics: ["documentation"],
});
