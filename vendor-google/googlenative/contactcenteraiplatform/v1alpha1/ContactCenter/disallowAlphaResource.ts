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

/**
 * Default imports for a policy.
 */
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import { ContactCenter } from "@pulumi/google-native/contactcenteraiplatform/v1alpha1";

/**
 * Disallow the use of non-stable (Alpha) resouces (contactcenteraiplatform.v1alpha1.ContactCenter).
 *
 * @severity medium
 * @frameworks none
 * @topics alpha, api, unstable
 * @link https://cloud.google.com/apis/design/versioning
 */
export const disallowAlphaResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "googlenative-contactcenteraiplatform-v1alpha1-contactcenter-disallow-alpha-resource",
        description: "Disallow the use of non-stable (Alpha) resouces (contactcenteraiplatform.v1alpha1.ContactCenter).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(ContactCenter, (_, args, reportViolation) => {
            reportViolation("Contactcenteraiplatform ContactCenter shouldn't use an unstable API (contactcenteraiplatform.v1alpha1.ContactCenter).");
        }),
    },
    vendors: ["google"],
    services: ["contactcenteraiplatform"],
    severity: "medium",
    topics: ["api", "unstable", "alpha"],
});
