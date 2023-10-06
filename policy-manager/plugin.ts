// Copyright 2016-2024, Pulumi Corporation.
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

import { version } from "./version";
const findup = require("findup-sync");
const micromatch = require("micromatch");

/**
 *  `loadPlugins()` loads NPM policy packages that are present in the `package.json` which
 *  names are matching the `globPatterns`.
 *
 * this function is typically used when you've authored a policy package and you want to
 * load and register the policies it contains.
 *
 * A common pattern example is `["@pulumi/*-compliance-policies"]` for Pulumi Premium
 * Policies.
 *
 * @param globPatterns An array of patterns as used by `micromatch`.
 * @returns No value is returned. Exceptions are thrown on error with a descriptive message.
 */
export function loadPlugins(globPatterns: Array<string>) {

    const packageJsonPath: string = findup("package.json");
    if (packageJsonPath === "") {
        throw new Error("unable to find 'package.json'");
    }

    const nodeModulePath: string = `${path.dirname(packageJsonPath)}/node_modules`;

    // console.error(`${packageJsonPath} -- ${module.filename}`);

    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
    if (packageJsonContent === "") {
        throw new Error(`it appears '${packageJsonPath}' is empty.`);
    }

    let packageJson;
    try {
        packageJson = JSON.parse(packageJsonContent);
    } catch (error) {
        throw new Error(`unable to parse content of '${packageJsonPath}'`);
    }

    if (packageJson.dependencies !== undefined) {

        const devDeps: Array<string> = [];

        for (const key of Object.keys(packageJson.dependencies)) {
            devDeps.push(key);
        }

        const matchedDevDeps: Array<string> = micromatch(devDeps, globPatterns);
        // console.error(`Raw dependencies: ${devDeps.length}`);
        // console.error(`Matching dependencies: ${matchedDevDeps.length}`);

        for (let index = 0; index < matchedDevDeps.length; index++) {
            // let isRegistered: boolean = false;
            const packageName = matchedDevDeps[index];
            const moduleProperties: Array<string> = [];
            const propertiesToCheck: Array<string> = ["version", "policyManagerVersion"];

            /*
             * Note: This may break newer version of yarn that don't use node_modules/
             * I don't know how to handle this for now.
             */
            const m = require(`${nodeModulePath}/${packageName}`);
            if (m === undefined || typeof m !== "object") {
                throw new Error(`the module '${packageName}' failed to load.`);
            }

            for (const x of Object.keys(m)) {
                moduleProperties.push(x);
            }

            const allPropertiesPresent = propertiesToCheck.every(val => moduleProperties.includes(val));
            if (allPropertiesPresent === false) {
                throw new Error(`the module '${packageName}' is missing one of more of the following properties: ${propertiesToCheck.join(", ")}.`);
            }

            if (version !== m.policyManagerVersion) {
                throw new Error(`The upstreasm version of '@pulumi/compliance-policy-manager' is ${version} but '${packageName}' depends on @pulumi/compliance-policy-manager ${m.policyManagerVersion}.\nThis will likely create issues and you should use upgrade this package version so the same @pulumi/compliance-policy-manager version is used everywhere.`);
            }
        }
    }

    return;
}
