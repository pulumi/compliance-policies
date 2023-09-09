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

import { LoadBalancer } from "@pulumi/aws/elb";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";

/**
 * Check that ELB Load Balancers uses more than one availability zone.
 *
 * @severity high
 * @frameworks none
 * @topics availability, network
 * @link https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/enable-disable-az.html
 */
export const configureMultiAvailabilityZone: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-elb-loadbalancer-configure-multi-availability-zone",
        description: "Check that ELB Load Balancers uses more than one availability zone.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(LoadBalancer, (loadBalancer, args, reportViolation) => {
            if (!loadBalancer.availabilityZones || loadBalancer.availabilityZones.length < 2) {
                reportViolation("ELB Load Balancers should use more than one availability zone.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["elb"],
    severity: "high",
    topics: ["network", "availability"],
});
