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
 * Check that ALB Load Balancers do not allow unencrypted (HTTP) traffic.
 *
 * @severity critical
 * @frameworks iso27001, pcidss
 * @topics network
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html
 */
export const disallowUnencryptedTraffic: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-alb-listener-disallow-unencrypted-traffic",
        description: "Check that ALB Load Balancers do not allow unencrypted (HTTP) traffic.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.alb.Listener, (listener, args, reportViolation) => {
            if ((listener.port && listener.port === 80) || (listener.protocol && listener.protocol === "HTTP")) {
                reportViolation("ALB Load Balancers should now allow unencrypted (HTTP) traffic.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["alb"],
    severity: "critical",
    topics: ["network"],
    frameworks: ["pcidss", "iso27001"],
});
