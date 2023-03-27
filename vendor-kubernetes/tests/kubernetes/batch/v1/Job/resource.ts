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

import * as kubernetes from "@pulumi/kubernetes";
import { ResourceValidationArgs } from "@pulumi/policy";
import { createResourceValidationArgs } from "@pulumi-premium-policies/unit-test-helpers";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(kubernetes.batch.v1.Job, {
        metadata: {
            labels: {
                "app.kubernetes.io/name": "MyApp",
                "app.kubernetes.io/instance": "MyApp-abcxyz",
                "app.kubernetes.io/version": "1.0.2",
                "app.kubernetes.io/component": "application",
                "app.kubernetes.io/part-of": "finance-erp",
                "app.kubernetes.io/managed-by": "pulumi",
            },
        },
        spec: {
            backoffLimit: 4,
            template: {
                metadata: {
                    labels: {
                        "app.kubernetes.io/name": "MyApp",
                        "app.kubernetes.io/instance": "MyApp-abcxyz",
                        "app.kubernetes.io/version": "1.0.2",
                        "app.kubernetes.io/component": "application",
                        "app.kubernetes.io/part-of": "finance-erp",
                        "app.kubernetes.io/managed-by": "pulumi",
                    },
                },
                spec: {
                    containers: [{
                        image: "nginx:1.14.2",
                        name: "nginx",
                        ports: [{
                            containerPort: 80,
                        }],
                        securityContext: {
                            readOnlyRootFilesystem: true,
                        },
                    }],
                },
            },
        },
    });
}
