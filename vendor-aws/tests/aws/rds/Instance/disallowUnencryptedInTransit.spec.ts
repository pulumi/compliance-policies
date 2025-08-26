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

import "mocha";
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails, assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import { getResourceValidationArgs } from "./resource";

describe("aws.rds.Instance.disallowUnencryptedInTransit", function() {
    const policy = policies.aws.rds.Instance.disallowUnencryptedInTransit;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-rds-instance-disallow-unencrypted-in-transit");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["rds"],
            severity: "high",
            topics: ["encryption", "transit"],
            frameworks: ["pcidss", "hitrust", "iso27001"],
        });
    });

    it("enforcementLevel", async function() {
        assertResourcePolicyEnforcementLevel(policy);
    });

    it("description", async function() {
        assertResourcePolicyDescription(policy);
    });

    it("code", async function () {
        assertCodeQuality(this.test?.parent?.title, __filename);
    });

    it("policy-config-include", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "corp-resource" ],
        });
        args.props.engine = "mysql";
        // No parameter group specified for SSL enforcement
        await assertHasResourceViolation(policy, args, { 
            message: "RDS Instance should use a parameter group that enforces SSL/TLS connections. Create a parameter group with 'rds.force_ssl=1' (PostgreSQL) or 'require_secure_transport=ON' (MySQL/MariaDB)." 
        });
    });

    it("policy-config-exclude", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "some-resource" ],
        });
        args.props.engine = "mysql";
        // Should be excluded from evaluation
        await assertNoResourceViolations(policy, args);
    });

    it("missing engine", async function() {
        const args = getResourceValidationArgs();
        // No engine specified
        await assertHasResourceViolation(policy, args, { 
            message: "RDS Instance must specify an engine to validate transit encryption." 
        });
    });

    it("mysql without parameter group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "mysql";
        await assertHasResourceViolation(policy, args, { 
            message: "RDS Instance should use a parameter group that enforces SSL/TLS connections. Create a parameter group with 'rds.force_ssl=1' (PostgreSQL) or 'require_secure_transport=ON' (MySQL/MariaDB)." 
        });
    });

    it("mysql with parameter group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "mysql";
        args.props.parameterGroupName = "mysql-ssl-required";
        await assertNoResourceViolations(policy, args);
    });

    it("postgres without parameter group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "postgres";
        await assertHasResourceViolation(policy, args, { 
            message: "RDS Instance should use a parameter group that enforces SSL/TLS connections. Create a parameter group with 'rds.force_ssl=1' (PostgreSQL) or 'require_secure_transport=ON' (MySQL/MariaDB)." 
        });
    });

    it("postgres with parameter group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "postgres";
        args.props.parameterGroupName = "postgres-ssl-required";
        await assertNoResourceViolations(policy, args);
    });

    it("mariadb without parameter group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "mariadb";
        await assertHasResourceViolation(policy, args, { 
            message: "RDS Instance should use a parameter group that enforces SSL/TLS connections. Create a parameter group with 'rds.force_ssl=1' (PostgreSQL) or 'require_secure_transport=ON' (MySQL/MariaDB)." 
        });
    });

    it("mariadb with parameter group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "mariadb";
        args.props.parameterGroupName = "mariadb-ssl-required";
        await assertNoResourceViolations(policy, args);
    });

    it("oracle without option group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "oracle-ee";
        await assertHasResourceViolation(policy, args, { 
            message: "RDS Instance should use an option group that includes SSL/TLS options for secure connections." 
        });
    });

    it("oracle with option group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "oracle-ee";
        args.props.optionGroupName = "oracle-ssl-options";
        await assertNoResourceViolations(policy, args);
    });

    it("sqlserver without option group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "sqlserver-ex";
        await assertHasResourceViolation(policy, args, { 
            message: "RDS Instance should use an option group that includes SSL/TLS options for secure connections." 
        });
    });

    it("sqlserver with option group", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "sqlserver-ex";
        args.props.optionGroupName = "sqlserver-ssl-options";
        await assertNoResourceViolations(policy, args);
    });

    it("unsupported engine", async function() {
        const args = getResourceValidationArgs();
        args.props.engine = "custom-engine";
        // Unsupported engines should not trigger violations
        await assertNoResourceViolations(policy, args);
    });
});
