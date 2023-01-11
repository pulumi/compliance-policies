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
import {
    ResourceValidationPolicy,
    validateResourceOfType,
} from "@pulumi/policy";
import { policiesManagement } from "@pulumi-premium-policies/policy-management";

/**
 * Checks that any ApiGatewayV2 Domain Name Configuration is enabled.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html
 */
export const enableDomainNameConfiguration: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-apigatewayv2-domainname-enable-domain-name-configuration",
        description: "Checks that any ApiGatewayV2 Domain Name Configuration is enabled.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.apigatewayv2.DomainName, (domainName, args, reportViolation) => {
            if (!domainName.domainNameConfiguration) {
                reportViolation("API GatewayV2 Domain Name Configuration should be enabled.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["apigatewayv2"],
    severity: "high",
    topics: ["network"],
});

/**
 * Checks that any ApiGatewayV2 Domain Name Security Policy uses secure/modern TLS encryption.
 *
 * @severity High
 * @link https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html
 */
export const configureDomainNameSecurityPolicy: ResourceValidationPolicy = policiesManagement.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-apigatewayv2-domainname-configure-domain-name-security-policy",
        description: "Checks that any ApiGatewayV2 Domain Name Security Policy uses secure/modern TLS encryption.",
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(aws.apigatewayv2.DomainName, (domainName, args, reportViolation) => {
            if (domainName.domainNameConfiguration && domainName.domainNameConfiguration.securityPolicy !== "TLS_1_2") {
                reportViolation("API GatewayV2 Domain Name Security Policy should use secure/modern TLS encryption.");
            }
        }),
    },
    vendors: ["aws"],
    services: ["apigatewayv2"],
    severity: "high",
    topics: ["network", "encryption"],
});
