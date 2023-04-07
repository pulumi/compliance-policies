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
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policyManager } from "@pulumi-premium-policies/policy-manager";
import * as azurenative from "@pulumi/azure-native";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (visualstudio.v20140401preview.Account).
 *
 * @severity medium
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-visualstudio-v20140401preview-account-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (visualstudio.v20140401preview.Account).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(azurenative.visualstudio.v20140401preview.Account, (_, args, reportViolation) => {
            reportViolation("Azure Account shouldn't use an unstable API (visualstudio.v20140401preview.Account).");
        }),
    },
    vendors: ["azure"],
    services: ["visualstudio", "account"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
