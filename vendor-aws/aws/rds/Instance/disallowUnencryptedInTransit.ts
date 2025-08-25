// Copyright 2016-2025, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Instance } from "@pulumi/aws/rds";
import { ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";
import { policyManager } from "@pulumi/compliance-policy-manager";

/**
 * Checks that RDS instance connections are encrypted in transit.
 *
 * @severity high
 * @frameworks hitrust, iso27001, pcidss
 * @topics encryption, transit
 * @link https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html
 */
export const disallowUnencryptedInTransit: ResourceValidationPolicy = policyManager.registerPolicy({
    resourceValidationPolicy: {
        name: "aws-rds-instance-disallow-unencrypted-in-transit",
        description: "Checks that RDS instance connections are encrypted in transit.",
        configSchema: policyManager.policyConfigSchema,
        enforcementLevel: "advisory",
        validateResource: validateResourceOfType(Instance, (instance, args, reportViolation) => {
            if (!policyManager.shouldEvalPolicy(args)) {
                return;
            }

            // Check if the engine supports SSL/TLS encryption
            const engine = instance.engine;
            if (!engine) {
                reportViolation("RDS Instance must specify an engine to validate transit encryption.");
                return;
            }

            // For engines that support parameter groups for SSL enforcement
            const sslSupportedEngines = ["mysql", "postgres", "mariadb"];
            const engineValue = typeof engine === "string" ? engine : engine.apply ? undefined : engine;
            
            if (engineValue && sslSupportedEngines.some(supportedEngine => 
                engineValue.toLowerCase().includes(supportedEngine))) {
                
                // Check if a parameter group is specified that would enforce SSL
                if (!instance.parameterGroupName) {
                    reportViolation(
                        "RDS Instance should use a parameter group that enforces SSL/TLS connections. " +
                        "Create a parameter group with 'rds.force_ssl=1' (PostgreSQL) or 'require_secure_transport=ON' (MySQL/MariaDB)."
                    );
                }
            }

            // For Oracle and SQL Server, check if the option group includes SSL options
            const optionGroupEngines = ["oracle", "sqlserver"];
            if (engineValue && optionGroupEngines.some(supportedEngine => 
                engineValue.toLowerCase().includes(supportedEngine))) {
                
                if (!instance.optionGroupName) {
                    reportViolation(
                        "RDS Instance should use an option group that includes SSL/TLS options for secure connections."
                    );
                }
            }
        }),
    },
    vendors: ["aws"],
    services: ["rds"],
    severity: "high",
    topics: ["encryption", "transit"],
    frameworks: ["pcidss", "hitrust", "iso27001"],
});
