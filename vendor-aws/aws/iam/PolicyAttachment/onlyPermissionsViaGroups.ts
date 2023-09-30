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

import { PolicyAttachment } from "@pulumi/aws/iam";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Ensure IAM Users Receive Permissions Only Through Groups.
 *
 * @severity high
 * @frameworks cis
 * @topics container, vulnerability
 * @link https://docs.aws.amazon.com/IAM/latest/UserGuide/id_groups_manage_attach-policy.html
 */
export const onlyPermissionsViaGroups: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-iam-policy-attachment-only-attachment-through-groups",
        description: "Ensure IAM Users Receive Permissions Only Through Groups.",
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(PolicyAttachment, (policyAttachment, args, reportViolation) => {
            if (policyAttachment.users && policyAttachment.users.length > 0) {
                reportViolation("Users should receive permissions via Group membership.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["iam"],
    severity: "high",
    topics: ["vulnerability"],
    frameworks: ["cis"],
});
