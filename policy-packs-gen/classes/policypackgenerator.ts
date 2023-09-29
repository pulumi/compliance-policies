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

import * as fs from "fs";
import * as path from "path";
import { Eta } from "eta";
import * as generator from "@babel/generator";
import * as prettier from "prettier";


export interface PolicyPackGeneratorArgs {

    /**
     * The directory where generated policy packs are stored.
     */
    destinationDir: string;

    /**
     * Overwrite existing files if they already exist.
     */
    overwrite: boolean;

    /**
     * Name of the policy pack vendor.
     */
    vendor: string;

    /**
     * A unique list of supported services.
     */
    services: string[];

    /**
     * A unique list of supported severities.
     */
    severities: string[];

    /**
     * A unique list of supported topics.
     */
    topics: string[];

    /**
     * A unique list of supported compliance frameworks.
     */
    frameworks: string[];
};

export class PolicyPackGenerator {

    private args: PolicyPackGeneratorArgs;

    constructor(args: PolicyPackGeneratorArgs) {
        this.args = args;

        for (let x = 0; x < args.frameworks.length; x++) {
            const framework: string = args.frameworks[x];

            const policyPackName: string = `${args.vendor}-${framework}-premium-policies-typescript`;
            const policyPackDir: string = path.resolve(`${args.destinationDir}/${policyPackName}`);

            if (!args.overwrite && fs.existsSync(policyPackDir)) {
                console.log(`Policy pack '${policyPackName}' in '${policyPackDir}' already exists. Use '--overwrite' to overwrite it.`);
                continue;
            }

            this.createPolicyPackDir(policyPackDir);
            this.genNpmrc(policyPackDir);
            this.genPulumiPolicyYaml(policyPackDir, args.vendor);
            this.genTsconfigJson(policyPackDir);
            this.genPackageJson(policyPackDir, args.vendor, framework);
            this.genIndexTs(policyPackDir, args.vendor, framework);

            console.log(`command: pulumi policy new ${policyPackName}`);
        }
    }

    private getEtaEngine(): Eta {
        return new Eta({
            autoTrim: [false, false],
            views: path.resolve(`${__dirname}/../templates`),
        });
    }

    private capitalizeFirstLetter(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    /**
     * This function creates the policy pack directory.
     *
     * @param policyPackDir Policy pack directory to create.
     */
    private createPolicyPackDir(policyPackDir: string) {
        if (fs.existsSync(policyPackDir)) {
            return;
        }

        fs.mkdirSync(policyPackDir, {
            recursive: true,
        });
    }

    /**
     * Generate a valid .npmrc and saves it `policyPackDir`.
     *
     * @param policyPackDir The policy pack destination folder.
     */
    private genNpmrc(policyPackDir: string) {

        const etaFile: string = ".npmrc.eta";
        const destFile: string = ".npmrc";

        const eta = this.getEtaEngine();

        const templateArgs = {};

        const fileContent: string = eta.render(etaFile, templateArgs);

        const fileHandle = fs.openSync(`${policyPackDir}/${destFile}`, "w", 0o640);
        fs.appendFileSync(fileHandle, fileContent);
        fs.closeSync(fileHandle);
    }

    /**
     * Generate a `PulumiPolicy.yaml` and saves it `policyPackDir`.
     *
     * @param policyPackDir The policy pack destination folder.
     */
    private genPulumiPolicyYaml(policyPackDir: string, vendor: string) {
        const etaFile: string = "PulumiPolicy.yaml.eta";
        const destFile: string = "PulumiPolicy.yaml";

        const eta = this.getEtaEngine();

        const templateArgs = {
            vendor: this.capitalizeFirstLetter(vendor),
        };

        const fileContent: string = eta.render(etaFile, templateArgs);

        const fileHandle = fs.openSync(`${policyPackDir}/${destFile}`, "w", 0o640);
        fs.appendFileSync(fileHandle, fileContent);
        fs.closeSync(fileHandle);
    }

    /**
     * Generate a `tsconfig.json` and saves it `policyPackDir`.
     *
     * @param policyPackDir The policy pack destination folder.
     */
    private genTsconfigJson(policyPackDir: string) {
        const etaFile: string = "tsconfig.json.eta";
        const destFile: string = "tsconfig.json";

        const eta = this.getEtaEngine();

        const templateArgs = {};

        const fileContent: string = eta.render(etaFile, templateArgs);

        const fileHandle = fs.openSync(`${policyPackDir}/${destFile}`, "w", 0o640);
        fs.appendFileSync(fileHandle, fileContent);
        fs.closeSync(fileHandle);
    }

    /**
     * Generate a `package.json` and saves it `policyPackDir`.
     *
     * @param policyPackDir The policy pack destination folder.
     * @param vendor Vendor name.
     * @param framework Framework name.
     */
    private genPackageJson(policyPackDir: string, vendor: string, framework: string) {
        const etaFile: string = "package.json.eta";
        const destFile: string = "package.json";

        const eta = this.getEtaEngine();

        const templateArgs = {
            vendor: vendor,
            framework: framework,
        };

        const fileContent: string = eta.render(etaFile, templateArgs);

        const fileHandle = fs.openSync(`${policyPackDir}/${destFile}`, "w", 0o640);
        fs.appendFileSync(fileHandle, fileContent);
        fs.closeSync(fileHandle);
    }

    /**
     * Generate a `index.ts` and saves it `policyPackDir`.
     *
     * @param policyPackDir The policy pack destination folder.
     * @param vendor Vendor name.
     * @param framework Framework name.
     */
    private genIndexTs(policyPackDir: string, vendor: string, framework: string) {
        const etaFile: string = "index.ts.eta";
        const destFile: string = "index.ts";

        const eta = this.getEtaEngine();

        const templateArgs = {
            vendor: vendor,
            services: this.args.services.join("\", \""),
            severities: this.args.severities.join("\", \""),
            topics: this.args.topics.join("\", \""),
            framework: framework,
            frameworks: this.args.frameworks.join("\", \""),
        };

        const fileContent: string = eta.render(etaFile, templateArgs);

        const fileHandle = fs.openSync(`${policyPackDir}/${destFile}`, "w", 0o640);
        fs.appendFileSync(fileHandle, fileContent);
        fs.closeSync(fileHandle);
    }
};
