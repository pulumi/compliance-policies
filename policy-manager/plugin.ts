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
 * A common pattern example is `["@pulumi-premium-policies/*-policies"]` for Pulumi Premium
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
                throw new Error(`The upstreasm version of '@pulumi-premium-policies/policy-manager' is ${version} but '${packageName}' depends on @pulumi-premium-policies/policy-manager ${m.policyManagerVersion}.\nThis will likely create issues and you should use upgrade this package version so the same @pulumi-premium-policies/policy-manager version is used everywhere.`);
            }
        }
    }

    return;
}
