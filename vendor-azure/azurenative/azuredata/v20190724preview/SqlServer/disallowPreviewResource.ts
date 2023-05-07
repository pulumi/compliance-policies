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
import { SqlServer } from "@pulumi/azure-native/azuredata/v20190724preview";

/**
 * Disallow the use of non-stable (Preview) Azure resouces (azuredata.v20190724preview.SqlServer).
 *
 * @severity medium
 * @frameworks none
 * @topics api, preview, unstable
 * @link https://learn.microsoft.com/en-us/rest/api/azure/
 */
export const disallowPreviewResource: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "azurenative-azuredata-v20190724preview-sqlserver-disallow-preview-resource",
        description: "Disallow the use of non-stable (Preview) Azure resouces (azuredata.v20190724preview.SqlServer).",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(SqlServer, (_, args, reportViolation) => {
            reportViolation("Azure SqlServer shouldn't use an unstable API (azuredata.v20190724preview.SqlServer). A compatible replacement can be found at 'azuredata.SqlServer'.");
        }),
    },
    vendors: ["azure"],
    services: ["azuredata"],
    severity: "medium",
    topics: ["api", "unstable", "preview"],
});
