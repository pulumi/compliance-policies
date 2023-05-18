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
 * Checks that Athena Databases storage is encrypted.
 *
 * @severity high
 * @frameworks iso27001, pcidss
 * @topics encryption, storage
 * @link https://docs.aws.amazon.com/athena/latest/ug/encryption.html
 */
export const disallowUnencryptedDatabase: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-athena-database-disallow-unencrypted-database",
        description: "Checks that Athena Databases storage is encrypted.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.athena.Database, (database, args, reportViolation) => {
            if (!database.encryptionConfiguration) {
                reportViolation("Athena Databases should be encrypted.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["athena"],
    severity: "high",
    topics: ["encryption", "storage"],
    frameworks: ["pcidss", "iso27001"],
});
