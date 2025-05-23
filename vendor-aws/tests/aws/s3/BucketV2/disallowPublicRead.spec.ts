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
import { assertHasResourceViolation, assertNoResourceViolations, assertResourcePolicyIsRegistered, assertResourcePolicyRegistrationDetails,  assertResourcePolicyName, assertResourcePolicyEnforcementLevel, assertResourcePolicyDescription, assertCodeQuality } from "@pulumi/compliance-policies-unit-test-helpers";
import * as policies from "../../../../index";
import * as enums from "../../enums";
import { getResourceValidationArgs } from "./resource";

describe("aws.s3.BucketV2.disallowPublicRead", function() {
    const policy = policies.aws.s3.BucketV2.disallowPublicRead;

    it("name", async function() {
        assertResourcePolicyName(policy, "aws-s3-bucketv2-disallow-public-read");
    });

    it("registration", async function() {
        assertResourcePolicyIsRegistered(policy);
    });

    it("metadata", async function() {
        assertResourcePolicyRegistrationDetails(policy, {
            vendors: ["aws"],
            services: ["s3"],
            severity: "critical",
            topics: ["storage", "security"],
            frameworks: ["cis", "pcidss", "hitrust", "iso27001"],
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
        args.props.acl = "public-read";
        await assertHasResourceViolation(policy, args, { message: "S3 BucketV2 ACLs should not be set to 'public-read', 'public-read-write' or 'authenticated-read'." });
    });

    it("policy-config-exclude", async function() {
        const args = getResourceValidationArgs("corp-resource", {
            excludeFor: [ "corp-.*" ],
            ignoreCase: false,
            includeFor: [ "my-.*", "some-resource" ],
        });
        args.props.acl = "public-read";
        await assertNoResourceViolations(policy, args);
    });

    it("#1", async function() {
        const args = getResourceValidationArgs();
        await assertNoResourceViolations(policy, args);
    });

    it("#2", async function() {
        const args = getResourceValidationArgs();
        args.props.acl = "public-read";
        await assertHasResourceViolation(policy, args, { message: "S3 BucketV2 ACLs should not be set to 'public-read', 'public-read-write' or 'authenticated-read'." });
    });

    it("#3", async function() {
        const args = getResourceValidationArgs();
        args.props.acl = "public-read-write";
        await assertHasResourceViolation(policy, args, { message: "S3 BucketV2 ACLs should not be set to 'public-read', 'public-read-write' or 'authenticated-read'." });
    });

    it("#4", async function() {
        const args = getResourceValidationArgs();
        args.props.acl = "authenticated-read";
        await assertHasResourceViolation(policy, args, { message: "S3 BucketV2 ACLs should not be set to 'public-read', 'public-read-write' or 'authenticated-read'." });
    });
});
