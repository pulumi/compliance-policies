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
import { GraphQuery } from "@pulumi/azure-native/resourcegraph/v20180901preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (resourcegraph.v20180901preview.GraphQuery).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-resourcegraph-v20180901preview-graphquery-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (resourcegraph.v20180901preview.GraphQuery).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(GraphQuery, (_, args, reportViolation) => {
            reportViolation("Azure GraphQuery shouldn't use an unstable API (resourcegraph.v20180901preview.GraphQuery). A compatible replacement can be found at 'resourcegraph.GraphQuery'.");
        }),
    },
    vendors: ["azure"],
    services: ["resourcegraph"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
