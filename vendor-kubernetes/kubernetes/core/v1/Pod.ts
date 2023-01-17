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

import * as k8s from "@pulumi/kubernetes";
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that Kubernetes Pods are not used directly.
 *
 * @severity Critical
 * @link https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
 */
export const disallowPod: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "kubernetes-core-v1-pod-disallow-pod",
        description: "Checks that Kubernetes Pods are not used directly.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(k8s.core.v1.Pod, (pod, args, reportViolation) => {
            reportViolation("Kubernetes Pods should not be used directly. Instead, you may want to use a Deployment, ReplicaSet, DaemonSet or Job.");
        }),
    },
    vendors: ["kubernetes"],
    services: ["core", "pod"],
    severity: "critical",
    topics: ["availability"],
});