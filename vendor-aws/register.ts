// Copyright 2016-2022, Pulumi Corporation.
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

import * as policyManager from "@pulumi-premium-policies/policy-management";

/**
 * This function is called by the upstream `@pulumi-premium-policies/policy-manager` package. The
 * function checks that the upstream version of `@pulumi-premium-policies/policy-manager` matches
 * the one this package depends on.
 *
 * @returns An error is thrown is there's a version mismatch.
 */
export function registerModule(policyManagerVersion: string) {
    if (policyManager.version !== policyManagerVersion) {
        console.error(`The upstreasm version of @pulumi-premium-policies/policy-manager is ${policyManagerVersion} but this package depends on @pulumi-premium-policies/policy-manager version ${policyManager.version}.\nThis will likely create issues and you should use upgrade this package version so the same @pulumi-premium-policies/policy-manager version is used everywhere.`);
        throw new Error();
    }
    return;
}
