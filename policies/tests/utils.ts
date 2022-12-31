// Copyright 2016-2023, Pulumi Corporation.
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

import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import * as parserTypes from "@babel/types";
import {
    ResourceValidationArgs,
    StackValidationArgs,
    StackValidationPolicy,
    PolicyResource,
    ResourceValidationPolicy,
} from "@pulumi/policy";
import * as policies from "../index";
import { PolicyInfo, PolicyMetadata, policiesManagement, FilterPolicyArgs } from "../utils";
import { Resource, Unwrap } from "@pulumi/pulumi";
import * as assert from "assert";

const empytOptions = {
    protect: false,
    ignoreChanges: [],
    aliases: [],
    customTimeouts: {
        createSeconds: 0,
        updateSeconds: 0,
        deleteSeconds: 0,
    },
    additionalSecretOutputs: [],
};

/**
 * The function createResourceValidationArgs() will create a ResourceValidationArgs using the `type` from
 * the specified `resourceClass` and `props` returned from the specified `argsFactory`.
 * The return type of the `argsFactory` is the unwrapped args bag for the resource, inferred
 * from the resource's constructor parameters.
 */
export function createResourceValidationArgs<TResource extends Resource, TArgs>(
    resourceClass: { new(name: string, args: TArgs, ...rest: any[]): TResource }, // eslint-disable-line @typescript-eslint/no-shadow
    args: Unwrap<NonNullable<TArgs>>,
    config?: Record<string, any>,
): ResourceValidationArgs {
    const type = (<any>resourceClass).__pulumiType;
    if (typeof type !== "string") {
        assert.fail("Could not determine Pulumi type from resourceClass.");
    }

    return {
        type: type as string,
        props: args,
        urn: "unknown",
        name: "unknown",
        opts: empytOptions,
        isType: (cls) => isTypeOf(type, resourceClass),
        asType: (cls) => isTypeOf(type, cls) ? <any>args : undefined,
        getConfig: <T>() => <T>(config || {}),
    };
}

export interface PolicyViolation {
    message: string;
    urn?: string;
}

/**
 * The function createStackValidationArgs() will create a StackValidationArgs, simulating a stack that has a
 * single resource with the provided type and properties.
 */
export function createStackValidationArgs<TResource extends Resource, TArgs>(
    resourceClass: { new(name: string, args: TArgs, ...rest: any[]): TResource },
    props: any,
    config?: Record<string, any>,
): StackValidationArgs {
    const type = (<any>resourceClass).__pulumiType;
    if (typeof type !== "string") {
        assert.fail("Could not determine Pulumi type from resourceClass.");
    }

    const testResource: PolicyResource = {
        type: type as string,
        props: props,
        urn: "unknown",
        name: "unknown",
        opts: empytOptions,
        dependencies: [],
        propertyDependencies: {},
        isType: (cls) => isTypeOf(type, cls),
        asType: (cls) => isTypeOf(type, cls) ? props : undefined,
    };

    return {
        resources: [testResource],
        getConfig: <T>() => <T>(config || {}),
    } as StackValidationArgs;
}

/**
 * The function runResourcePolicy() will run some basic checks for a policy's metadata, and then
 * execute its rules with the provided type and properties.
 */
async function runResourcePolicy(resPolicy: ResourceValidationPolicy, args: ResourceValidationArgs): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];
    const report = (message: string, urn?: string) => {
        violations.push({ message: message, urn: urn });
    };
    const validations = Array.isArray(resPolicy.validateResource)
        ? resPolicy.validateResource
        : [resPolicy.validateResource];
    for (const validation of validations) {
        await Promise.resolve(validation(args, report));
    }
    return violations;
}

/**
 * The function runStackPolicy() will run some basic checks for a policy's metadata, and then
 * execute its rules with the provided type and properties.
 */
async function runStackPolicy(stackPolicy: StackValidationPolicy, args: StackValidationArgs): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];
    const report = (message: string, urn?: string) => {
        violations.push({ message: message, urn: urn });
    };

    await Promise.resolve(stackPolicy.validateStack(args, report));
    return violations;
}

/**
 * The function assertNoViolations() runs the policy and confirms no violations were found.
 */
function assertNoViolations(allViolations: PolicyViolation[]) {
    if (allViolations && allViolations.length > 0) {
        for (const violation of allViolations) {
            const urnSuffix = violation.urn ? `(URN=${violation.urn})` : "";
            console.log(`VIOLATION: ${violation.message} ${urnSuffix}`);
        }
        assert.fail("got violations but wasn't expecting any.");
    }
}


/**
 * The function assertHasViolation() runs the policy and confirms the expected violation is reported.
 */
function assertHasViolation(allViolations: PolicyViolation[], wantViolation: PolicyViolation) {
    if (!allViolations || allViolations.length === 0) {
        assert.fail("no violations reported, but expected one");
    } else {
        for (const reportedViolation of allViolations) {
            // If we expect a specific URN, require that in the reported violation.
            // The converse is not true, we allow test authors to omit the URN
            // even if it is included in the matched violation.
            if (wantViolation.urn && !reportedViolation.urn) {
                continue;
            }

            const messageMatches = reportedViolation.message.indexOf(wantViolation.message) !== -1;
            let urnMatches = true;
            if (reportedViolation.urn && wantViolation.urn) {
                urnMatches = reportedViolation.urn.indexOf(wantViolation.urn) !== -1;
            }

            if (messageMatches && urnMatches) {
                // Success! We found the violation we were looking for.
                return;
            }
        }

        // Print all reported violations for easier debugging of failing tests.
        console.log("Reported Violations:");
        for (const reported of allViolations) {
            console.log(`urn: ${reported.urn} - message: ${reported.message}`);
        }
        assert.fail(`violation with substrings message:'${wantViolation.message}' urn:'${wantViolation.urn}' not found.'`);
    }
}

/**
 * The function daysFromNow() returns "now", d days in the future or past.
 */
export function daysFromNow(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

/**
 * The function asserts the resource provided reports a violation.
 */
export async function assertHasResourceViolation(resPolicy: ResourceValidationPolicy, args: ResourceValidationArgs, wantViolation: PolicyViolation) {
    const allViolations = await runResourcePolicy(resPolicy, args);
    assertHasViolation(allViolations, wantViolation);
}

/**
 * The function asserts the resource provided does NOT reports any violation.
 */
export async function assertNoResourceViolations(resPolicy: ResourceValidationPolicy, args: ResourceValidationArgs) {
    const allViolations = await runResourcePolicy(resPolicy, args);
    assertNoViolations(allViolations);
}

/**
 * The function asserts the stack provided reports a violation.
 */
export async function assertNoStackViolations(stackPolicy: StackValidationPolicy, args: StackValidationArgs) {
    const allViolations = await runStackPolicy(stackPolicy, args);
    assertNoViolations(allViolations);
}

/**
 * The function asserts the stack provided does NOT reports any violation.
 */
export async function assertHasStackViolation(
    stackPolicy: StackValidationPolicy, args: StackValidationArgs, wantViolation: PolicyViolation) {
    const allViolations = await runStackPolicy(stackPolicy, args);
    assertHasViolation(allViolations, wantViolation);
}

/**
 * The function asserts the policy has been registered.
 */
export function assertResourcePolicyIsRegistered(policy: ResourceValidationPolicy) {
    if (!policies.policiesManagement.getPolicyByName(policy.name)) {
        assert.fail(`Policy ${policy.name} is not registered.`);
    }
}

/**
 * The function asserts the policy name is as expected.
 */
export function assertResourcePolicyName(policy: ResourceValidationPolicy, name: string) {
    const re = /([a-z]{1}[\da-z\-]+[\da-z]{1})/g;

    if (!isLowerCase(policy.name)) {
        assert.fail(`Policy name '${policy.name}' should be in lower case.`);
    }

    if (policy.name !== name) {
        assert.fail(`Policy name '${policy.name}' isn't matching the expected name '${name}'.`);
    }

    const nameMatch = policy.name.match(re);
    if (!nameMatch) {
        assert.fail(`Policy name '${policy.name}' should match '${re}' (#1)`);
    } else {
        if (nameMatch.length !== 1) {
            assert.fail(`Policy name '${policy.name}' should match '${re}' (#2)`);
        }
    }
}

/**
 * The function asserts the policy has the correct enforcementLevel.
 */
export function assertResourcePolicyEnforcementLevel(policy: ResourceValidationPolicy) {
    if (policy.enforcementLevel !== "advisory") {
        assert.fail(`Policy name '${policy.name}' should have its enforcementLevel set to 'advisory'.`);
    }
}

/**
 * The function asserts the policy has a sentence as a description.
 */
export function assertResourcePolicyDescription(policy: ResourceValidationPolicy) {
    if (!policy.description) {
        assert.fail(`Policy name '${policy.name}' should have a description.`);
    } else {
        const sentenceEndGrouping = /([.?!])(?:\s+|$)/gmu;
        const puntuations = policy.description.match(sentenceEndGrouping);

        if (puntuations === null) {
            assert.fail(`The policy '${policy.name}' description requires a complete sentence.`);
        } else {
            const sentences = policy.description.split(/[.?!](?:\s+|$)/u).map((sentence, idx) => {
                // re-add the punctuation back to the sentence
                if(puntuations[idx]) {
                    return `${sentence}${puntuations[idx]}`;
                }
                return sentence;
            });

            const re = /^[A-Z].*[.?!]/gu;
            for(let x = 0; x < sentences.length; x++) {
                if(sentences[x]) {
                    const descriptionMatch = sentences[x].match(re);
                    if (!descriptionMatch) {
                        assert.fail(`The policy '${policy.name}' description requires a complete sentence.`);
                    }
                }
            }
        }
    }
}

/**
 * The function asserts the policy has the expeced policy metadata.
 */
export function assertResourcePolicyRegistrationDetails(policy: ResourceValidationPolicy, metadata: PolicyMetadata) {
    const registeredPolicy: PolicyInfo | undefined = policies.policiesManagement.getPolicyByName(policy.name);
    if (!registeredPolicy) {
        assert.fail(`Policy ${policy.name} is not registered.`);
    }
    if (registeredPolicy) {
        /**
         * Perform checks on Frameworks.
         */
        if (registeredPolicy.policyMetadata.frameworks && metadata.frameworks
            && registeredPolicy.policyMetadata.frameworks.length && metadata.frameworks.length) {
            if(!compareArray(registeredPolicy.policyMetadata.frameworks, metadata.frameworks)) {
                assert.fail(`Policy ${policy.name} 'frameworks' don't match.`);
            }
        } else {
            if (
                (!registeredPolicy.policyMetadata.frameworks && metadata.frameworks) ||
                (registeredPolicy.policyMetadata.frameworks && !metadata.frameworks)) {
                assert.fail(`Policy ${policy.name} 'frameworks' don't match.`);
            }
        }
        /**
         * Perform checks on Services.
         */
        if (registeredPolicy.policyMetadata.vendors && !registeredPolicy.policyMetadata.vendors.includes("kubernetes")) {
            if (registeredPolicy.policyMetadata.services && registeredPolicy.policyMetadata.services.length) {
                if (registeredPolicy.policyMetadata.services.length > 1) {
                    assert.fail(`Policy ${policy.name} should be associated to one service only.`);
                }
            }
        }
        if (registeredPolicy.policyMetadata.services && metadata.services
            && registeredPolicy.policyMetadata.services.length && metadata.services.length) {
            if(!compareArray(registeredPolicy.policyMetadata.services, metadata.services)) {
                assert.fail(`Policy ${policy.name} 'services' don't match.`);
            }
        } else {
            if (
                (!registeredPolicy.policyMetadata.services && metadata.services) ||
                (registeredPolicy.policyMetadata.services && !metadata.services)) {
                assert.fail(`Policy ${policy.name} 'services' don't match.`);
            }
        }
        /**
         * Perform checks on Severities.
         */
        if (registeredPolicy.policyMetadata.severity) {
            switch(registeredPolicy.policyMetadata.severity) {
            case "low":
            case "medium":
            case "high":
            case "critical":
                break;
            default:
                assert.fail(`Policy ${policy.name} 'severity' isn't valid ('low', 'medium', 'high', 'critical').`);
            }
        }
        if (registeredPolicy.policyMetadata.severity && metadata.severity) {
            if (registeredPolicy.policyMetadata.severity !== metadata.severity) {
                assert.fail(`Policy ${policy.name} 'severity' don't match.`);
            }
        } else {
            if (
                (!registeredPolicy.policyMetadata.severity && metadata.severity) ||
                (registeredPolicy.policyMetadata.severity && !metadata.severity)) {
                assert.fail(`Policy ${policy.name} 'severity' don't match.`);
            }
        }
        /**
         * Perform checks on Topics.
         */
        if (registeredPolicy.policyMetadata.topics && metadata.topics
            && registeredPolicy.policyMetadata.topics.length && metadata.topics.length) {
            if(!compareArray(registeredPolicy.policyMetadata.topics, metadata.topics)) {
                assert.fail(`Policy ${policy.name} 'topics' don't match.`);
            }
        } else {
            if (
                (!registeredPolicy.policyMetadata.topics && metadata.topics) ||
                (registeredPolicy.policyMetadata.topics && !metadata.topics)) {
                assert.fail(`Policy ${policy.name} 'topics' don't match.`);
            }
        }
        /**
         * Perform checks on Vendors.
         */
        if (registeredPolicy.policyMetadata.vendors && registeredPolicy.policyMetadata.vendors.length) {
            if (registeredPolicy.policyMetadata.vendors.length > 1) {
                assert.fail(`Policy ${policy.name} should be associated to one vendor only.`);
            }
        }

        if (registeredPolicy.policyMetadata.vendors && metadata.vendors
            && registeredPolicy.policyMetadata.vendors.length && metadata.vendors.length) {
            if(!compareArray(registeredPolicy.policyMetadata.vendors, metadata.vendors)) {
                assert.fail(`Policy ${policy.name} 'vendors' don't match.`);
            }
        } else {
            if (
                (!registeredPolicy.policyMetadata.vendors && metadata.vendors) ||
                (registeredPolicy.policyMetadata.vendors && !metadata.vendors)) {
                assert.fail(`Policy ${policy.name} 'vendors' don't match.`);
            }
        }
    }
}

/**
 * The function asserts some policies have been registered.
 */
export function assertHasRegisteredPolicies() {
    if (policiesManagement.getStats().policyCount === 0) {
        assert.fail(`Didn't find any registered policies.`);
    }
}

/**
 * The function asserts 1 or more policies are up for selection.
 */
export function assertHasRemainingPolicies() {
    if (policiesManagement.getStats().remainingPolicyCount === 0) {
        assert.fail(`Didn't find any remaining policies.`);
    }
}

/**
 * The function asserts the number of selectable policies is the same as the total of all registered policies.
 */
export function assertHasAllRemainingPolicies() {
    if (policiesManagement.getStats().policyCount < 1) {
        assert.fail(`Registered policies count and remaining policies count don't match. ${policiesManagement.getStats().remainingPolicyCount} policies but ${policiesManagement.getStats().policyCount} are registered.`);
    }

    if (policiesManagement.getStats().remainingPolicyCount !== policiesManagement.getStats().policyCount) {
        assert.fail(`Registered policies count and remaining policies count don't match. ${policiesManagement.getStats().remainingPolicyCount} policies but ${policiesManagement.getStats().policyCount} are registered.`);
    }
}

/**
 * The function asserts no more policies are selectable.
 */
export function assertHasNoRemainingPolicies() {
    if (policiesManagement.getStats().remainingPolicyCount !== 0) {
        assert.fail(`Found remaining policies but expected none.`);
    }
}

/**
 * The function asserts an expected number of policies is selectable.
 */
export function assertExpectedRemainingPolicyCount(expectedtedRemainingPolicyCount: number) {
    if (policiesManagement.getStats().remainingPolicyCount !== expectedtedRemainingPolicyCount) {
        assert.fail(`Expected remaining policy counts don't match. Found ${policiesManagement.getStats().remainingPolicyCount} but expeced ${expectedtedRemainingPolicyCount}.`);
    }
}

/**
 * The function asserts no policies are selected twice.
 */
export function assertNoDoubleSelection(filterPolicy: FilterPolicyArgs) {
    policies.policiesManagement.resetPolicyfilter();
    const firstSelection = policies.policiesManagement.filterPolicies(filterPolicy);
    const secondSelection = policies.policiesManagement.filterPolicies(filterPolicy);
    if (secondSelection.length > 0) {
        assert.fail(`Some policies haven't been returned after they'd been already selected.`);
    }
    policies.policiesManagement.resetPolicyfilter();
}

/**
 * The function asserts the enforcementLevel is applied when selecting policies.
 */
export function assertSelectionEnforcementLevel(filterPolicy: FilterPolicyArgs, enforcementLevel: string) {
    policies.policiesManagement.resetPolicyfilter();

    const policySelection = policies.policiesManagement.filterPolicies(filterPolicy, enforcementLevel);
    policySelection.forEach((policy) => {
        if (policy.enforcementLevel !== enforcementLevel) {
            assert.fail(`Policy enforcementLevel not set on during policy selection.`);
        }
    });

    policies.policiesManagement.resetPolicyfilter();
}

interface SourceFileDetails {
    suiteName?: string;
    sourceFile?: string;
    policyVarName?: string;
    parserResults?: parser.ParseResult<parserTypes.File>;
    error?: string;
}

interface PolicyDetails {
    sourceFileDetails?: SourceFileDetails;
    name?: string;
    description?: string;
    severity?: string;
    comment?: string;
    error?: string;
}

const allowedPolicyVerbs = [
    "missing",
    "disallow",
    "enable",
    "configure",
];

/**
 * This function assert the code quality of a policy source file.
 *
 * @param suiteName The MochaJS suite name.
 */
export function assertCodeQuality(suiteName?: string) {
    const sourceFileDetails = parseSourceFile(suiteName);

    // https://astexplorer.net/#/gist/8542f6a83839e9db21d7c27bc482e828/7a1341ec228bcd5d574324039ff7fab84244dd6f

    if (sourceFileDetails.error) {
        assert.fail(sourceFileDetails.error);
    }
    if (!sourceFileDetails.policyVarName) {
        assert.fail("Unable to determine policy variable name.");
    }
    if (!sourceFileDetails.parserResults) {
        assert.fail(`Failed to parse file ${sourceFileDetails.sourceFile}.`);
    }

    const parserResults: parser.ParseResult<parserTypes.File> = sourceFileDetails.parserResults;

    let policyDetails: PolicyDetails = {};

    for(let codeBlockIndex = 0; codeBlockIndex < parserResults.program.body.length; codeBlockIndex++) {
        const node = parserResults.program.body[codeBlockIndex];

        if (node.type === "ExportNamedDeclaration") {
            policyDetails = getPolicyDetails(node, sourceFileDetails.policyVarName);

            if (!policyDetails.error && !policyDetails.name) {
                /*
                 * No error is reported, so the processed "ExportNamedDeclaration" is not the one
                 * for the current policy. Let's continue to the next one then.
                 */
                continue;
            }
            policyDetails.sourceFileDetails = sourceFileDetails;
            break;
        }
    }

    if (!policyDetails.error && !policyDetails.name) {
        assert.fail(`Unable to locate the policy code in ${sourceFileDetails.sourceFile}`);
    }
    if (policyDetails.error) {
        assert.fail(policyDetails.error);
    }

    if (!policyDetails.comment?.includes(policyDetails.description!)) {
        assert.fail("The jsDoc description isn't match the policy's description.");
    }

    if (!policyDetails.comment.toLowerCase().includes(`@severity ${policyDetails.severity}`)) {
        assert.fail("The policy's severity isn't matching the one in the jsDoc comment.");
    }
    checkPolicyVerbDetails(policyDetails);
    if (policyDetails.error) {
        assert.fail(policyDetails.error);
    }
}

/**
 * This function takes a suite name and returns parsed source file.
 *
 * @param suiteName The MochaJS suite name.
 * @returns The parsed corresponding source file.
 */
function parseSourceFile(suiteName?: string): SourceFileDetails {
    const sourceFileDetails: SourceFileDetails = {};
    sourceFileDetails.suiteName = suiteName;

    if (!sourceFileDetails.suiteName) {
        sourceFileDetails.error = "The test suite name isn't present.";
        return sourceFileDetails;
    }

    /*
     * It may be useful to move this out of this function so the
     * value (which is always the same) is not computed on each test.
     */
    const policiesBasePath = path.dirname(__dirname);
    const splitResourceSuiteName = sourceFileDetails.suiteName.split(".");

    sourceFileDetails.policyVarName = splitResourceSuiteName.pop();

    if (!sourceFileDetails.policyVarName) {
        sourceFileDetails.error = "Unable to determine the policy variable name. Is the suite name in the correct format?";
        return sourceFileDetails;
    }

    splitResourceSuiteName[splitResourceSuiteName.length-1] = camelize(splitResourceSuiteName[splitResourceSuiteName.length-1]);
    sourceFileDetails.sourceFile = `${policiesBasePath}/${splitResourceSuiteName.join("/")}.ts`;

    sourceFileDetails.parserResults = parser.parse(fs.readFileSync(sourceFileDetails.sourceFile, "utf-8"), {
        attachComment: true,
        sourceType: "module",
        sourceFilename: sourceFileDetails.sourceFile,
        plugins: [
            "typescript",
        ],
    });

    return sourceFileDetails;
}

/**
 * This functions the necessary details related to the current registered policy.
 *
 * @param objectExpression An object expression as it is provided to `policiesManagement.registerPolicy()`.
 * @returns An array of information related to the current policy.
 */
function getPolicyDetails(node: parserTypes.ExportNamedDeclaration, policyVarName: string): PolicyDetails {
    const policyDetails: PolicyDetails = {};

    if (!node.declaration || node.declaration.type !== "VariableDeclaration") {
        return policyDetails;
    }

    if (node.declaration.declarations.length !== 1) {
        return policyDetails;
    }

    if (node.declaration.declarations[0].id.type === "Identifier") {
        if (node.declaration.declarations[0].id.name === policyVarName) {
            /*
             * We have a match with the exported variable so we're going to process it.
             */
            if (!node.leadingComments) {
                policyDetails.error = "The policy is missing its jsDoc comment.";
                return policyDetails;
            }
            const jsDocDetails = getPolicyComment(node);
            if (jsDocDetails.error) {
                assert.fail(jsDocDetails.error);
            }
            policyDetails.comment = jsDocDetails.comment;

            /*
             * This will most likely blow up in my face sooner or later because this
             * feels way too brittle. I just don't know how to parse this in a more
             * flexible way - for now.
             */
            if (node.declaration.declarations[0].init &&
                node.declaration.declarations[0].init.type === "CallExpression" &&
                node.declaration.declarations[0].init.callee.type === "MemberExpression" &&
                node.declaration.declarations[0].init.callee.property.type === "Identifier" &&
                node.declaration.declarations[0].init.callee.property.name === "registerPolicy" &&
                node.declaration.declarations[0].init.arguments[0].type === "ObjectExpression") {
                const objectExpression = node.declaration.declarations[0].init.arguments[0];
                for(let oepIndex = 0; oepIndex < objectExpression.properties.length; oepIndex++) {
                    if (objectExpression.properties[oepIndex].type !== "ObjectProperty") {
                        continue;
                    }
                    const objectProperty = <parserTypes.ObjectProperty>objectExpression.properties[oepIndex];
                    switch(objectProperty.value.type) {
                    case "ObjectExpression": // the `resourceValidationPolicy`
                        if (objectProperty.key.type === "Identifier" && objectProperty.key.name.includes("resourceValidationPolicy")) {
                            const p = getPolicyCodeDetails(objectProperty.value.properties);
                            policyDetails.name = p.name;
                            policyDetails.description = p.description;
                        }
                        break;
                    case "ArrayExpression": // Vendors[] || Services[] || Frameworks[] || Topics[]
                        break;
                    case "StringLiteral": // Policy Severity
                        policyDetails.severity = objectProperty.value.value.toLowerCase(); // this needs to be lowercase as the value is made case insensitive
                        break;
                    default:
                        continue;
                    }
                }
            }
        }

    }

    return policyDetails;
}

/**
 * This function checks for the policy verb (missing, disallow...) and the consistency of the policy variable name.
 *
 * @param policyDetails The `policyDetails` to process. The `policyDetails` should have `.sourceFileDetails` set.
 * @returns An updated `policyDetails`.
 */
function checkPolicyVerbDetails(policyDetails: PolicyDetails): PolicyDetails {

    if (!policyDetails.sourceFileDetails || !policyDetails.sourceFileDetails.suiteName || !policyDetails.name) {
        policyDetails.error = "Missing or incomplete policy details. Unable to process.";
        return policyDetails;
    }

    const splitResourceSuiteName = policyDetails.sourceFileDetails.suiteName.split(".");
    splitResourceSuiteName.pop();

    const basePolicyName = splitResourceSuiteName.join("-").toLowerCase();
    const policyName = policyDetails.name.replace(`${basePolicyName}-`, "");
    const splitPolicyName = policyName.split("-");

    if (!allowedPolicyVerbs.includes(splitPolicyName[0])) {
        policyDetails.error = `The policy verb '${splitPolicyName[0]}' is not allowed.`;
        return policyDetails;
    }

    /*
     * intentionally skip the policy verb as it's lower case in the policy
     * variable name.
     */
    const splitPolicyWords = [...splitPolicyName];
    for (let wordIndex = 1; wordIndex < splitPolicyWords.length; wordIndex++) {
        splitPolicyWords[wordIndex] = capitalize(splitPolicyWords[wordIndex]);
    }

    const computedPolicyVarName = splitPolicyWords.join("");

    if (computedPolicyVarName !== policyDetails.sourceFileDetails.policyVarName) {
        policyDetails.error = `The policy variable name ${policyDetails.sourceFileDetails.policyVarName} doesn't match with the expected variable name ${computedPolicyVarName}.`;
        return policyDetails;
    }

    return policyDetails;
}

/**
 * This function get the policy code details (name and description).
 *
 * @param properties The properties array that's passed to `resourceValidationPolicy`.
 * @returns An array of strings. [name, description].
 */
function getPolicyCodeDetails(properties: (parserTypes.ObjectProperty | parserTypes.ObjectMethod | parserTypes.SpreadElement)[]): PolicyDetails {
    const policyDetails: PolicyDetails = {};

    properties.forEach((property) => {
        if (property.type !== "ObjectProperty" || property.key.type !== "Identifier") {
            return;
        }

        switch(property.key.name) {
        case "name":
            if (property.value.type === "StringLiteral") {
                policyDetails.name = property.value.value;
            }
            break;
        case "description":
            if (property.value.type === "StringLiteral") {
                policyDetails.description = property.value.value;
            }
            break;
        default:
        }
    });
    return policyDetails;
}

/**
 * Gets the jsDoc comment block for the current code block.
 *
 * @param comments An array of Comment containing the leading comments of the current code block.
 * @returns Returns the single jsDoc comment block found otherwise will `assert.fail()`.
 */
function getPolicyComment(node: parserTypes.ExportNamedDeclaration): PolicyDetails {
    const policyCommentDetails: PolicyDetails = {};

    if (!node.leadingComments) {
        policyCommentDetails.error = "The policy should have a jsDoc comment block to describe the policy.";
        return policyCommentDetails;
    }

    let jsDocCommentBlockIndex: number = -1;
    let jsDocCommentBlocksCount: number = 0;
    let commentBlocksCount: number = 0;
    let commentLinesCount: number = 0;

    for (let commentIndex = 0; commentIndex < node.leadingComments.length; commentIndex++) {
        const comment = node.leadingComments[commentIndex];
        if (comment.type === "CommentBlock") {
            if (comment.value.startsWith("*\n")) {
                /*
                 * This appears to be a proper jsDoc comment block because it starts
                 * with '/**' (@babel/parser remove the initial '/*')
                 */
                jsDocCommentBlocksCount++;
                jsDocCommentBlockIndex = commentIndex;
            } else {
                /*
                 * this is a generic comment block and not jsDoc one.
                 */
                commentBlocksCount++;
            }
        } else {
            commentLinesCount++;
        }
    }
    if (commentLinesCount > 0) {
        policyCommentDetails.error = "The policy should not use comment lines leading to the policy declaration.";
        return policyCommentDetails;
    }
    if (commentBlocksCount > 0) {
        policyCommentDetails.error = "The policy should not use comment blocks leading to the policy declaration.";
        return policyCommentDetails;
    }
    if (jsDocCommentBlocksCount > 1) {
        policyCommentDetails.error = "The policy should not use more than one jsDoc comment blocks leading to the policy declaration.";
        return policyCommentDetails;
    }

    policyCommentDetails.comment = node.leadingComments[jsDocCommentBlockIndex].value;
    return policyCommentDetails;
}

/**
 * This function converts the 1st character to a upper case character.
 *
 * @param str The input string.
 * @returns A capitalized string.
 */
function capitalize(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (match, index) {
        if (+match === 0){
            return ""; // or if (/\s+/.test(match)) for white spaces
        }
        return index === 0 ? match.toUpperCase() : match.toLowerCase();
    });
}

/**
 * This function converts a string into a camelCase string.
 *
 * @param str The input string.
 * @returns A camelCase string.
 */
function camelize(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (match, index) {
        if (+match === 0){
            return ""; // or if (/\s+/.test(match)) for white spaces
        }
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}
/**
 * Determine whether the given `input` is a string in lowercase.
 */
function isLowerCase (input: string) {
    return input === String(input).toLowerCase();
}

/**
 * This function compares 2 arrays.
 * See for context: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript/.
 */
function compareArray(array1: string[], array2: string[]): boolean {

    const array2Sorted = array2.slice().sort();
    return (array1.length === array2.length && array1.slice().sort().every((value, index) => {
        return value === array2Sorted[index];
    }));
}

/**
 * Helper to check if `type` is the type of `resourceClass`.
 */
function isTypeOf<TResource extends Resource>(
    type: string,
    resourceClass: { new(...rest: any[]): TResource },
): boolean {
    const isInstance = (<any>resourceClass).isInstance;
    return isInstance &&
        typeof isInstance === "function" &&
        isInstance({ __pulumiType: type }) === true;
}
