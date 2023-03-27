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
 * Checks that all Ingress Security Groups rules have a description.
 *
 * @severity Low
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/working-with-security-groups.html
 */
export const missingIngressRuleDescription: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-securitygroup-missing-ingress-rule-description",
        description: "Checks that all Ingress Security Groups rules have a description.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (securityGroup, args, reportViolation) => {
            if (securityGroup.ingress) {
                securityGroup.ingress.forEach((ingress) => {
                    if (!ingress.description) {
                        reportViolation("EC2 Security Groups Ingress rules should have a description.");
                    }
                });
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "low",
    topics: ["documentation"],
});
