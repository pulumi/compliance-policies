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

import { SecurityGroup } from "@pulumi/aws/ec2";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Check that EC2 Security Groups do not allow ingress traffic from the Internet.
 *
 * @severity critical
 * @frameworks none
 * @topics network
 * @link https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules-reference.html
 */
export const disallowPublicInternetIngress: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-ec2-securitygroup-disallow-public-internet-ingress",
        description: "Check that EC2 Security Groups do not allow ingress traffic from the Internet.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(SecurityGroup, (securityGroup, _, reportViolation) => {
            if (securityGroup.ingress) {
                if (securityGroup.ingress.some((ingressRule) => ingressRule.cidrBlocks?.includes("0.0.0.0/0"))) {
                    reportViolation("EC2 Security Groups should not permit ingress traffic from the public internet (0.0.0.0/0).");
                }
                if (securityGroup.ingress.some((ingressRule) => ingressRule.ipv6CidrBlocks?.includes("::/0"))) {
                    reportViolation("EC2 Security Groups should not permit ingress traffic from the public internet (::/0).");
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["ec2"],
    severity: "critical",
    topics: ["network"],
});
