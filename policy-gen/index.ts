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

import * as commander from "commander";

import { KubernetesProvider } from "./providers/kubernetes";
import { AzureNativeProvider } from "./providers/azurenative";
import { GoogleNativeProvider } from "./providers/googlenative";

interface RunArgs {
    /**
     * Name of the provider.
     */
    name: string;
    /**
     * Version of the provider.
     */
    version: string;
    /**
     * Vendor's directory to use to save the generated policies and unit tests.
     */
    directory: string;
    /**
     * Generate policies and unit tests but do not save any files locally.
     */
    dryrun: boolean;
    /**
     * The maximum number of policies to generate in a single run. Existing policies are skipped and not counted.
     */
    maxPolicyCount: number;
}

/**
 * An entrypoint.
 *
 * @param provider The name of a pulumi provider.
 */
function cmd_run(args: RunArgs) {

    switch(args.name) {
    case "kubernetes":
        new KubernetesProvider({
            ...args,
        }).generatePolicies();
        break;

    case "azure-native":
        new AzureNativeProvider({
            ...args,
        }).generatePolicies();
        break;

    case "google-native":
        new GoogleNativeProvider({
            ...args,
        }).generatePolicies();
        break;

    default:
        console.log(`The '${args.name}' provider isn't supported.`);
        break;
    }

    // const serializer = new jsSerial.JsonSerializer();
    // const text = serializer.stringify(pulumiProvider);
    // console.log(text);
    // const obj: Map<string, Map<string, Map<string, string>>> = serializer.parse(text, (error) => console.error(error));
    // console.log(obj);
}

/**
 * Display policy-gen version.
 */
function cmd_version() {
    console.log("v0.0.0");
}

/**
 * Allow overwriting policy files that already exist.
 */
commander.program
    .command("run")
    .description("Run the program")
    .requiredOption("--provider <providers>", "The desired Pulumi provider to generate policies for.")
    .requiredOption("--version <version>", "The provider version to process.")
    .requiredOption("--directory <vendor-directory>", "Path to the vendor's directory to save the generated polcies.")
    .option("--dryrun", "Generate all the policies and unit tests but doesn't save anything locally.")
    .option("--max <number>", "The maximum number of policies to generate.", "25")
    .action((options) => {
        const name: string = (options.provider as string);
        const version: string = (options.version as string);
        const directory: string = (options.directory as string);
        const dryrun: boolean = options.dryrun ? true : false;
        const maxPolicies: number = parseInt(options.max, 10);

        console.log(`* provider: ${name}, version: ${version}, dry-run: ${dryrun && "yes" || "no"}, maximum policies: ${maxPolicies}`);

        cmd_run({
            name: name,
            version: version,
            directory: directory,
            dryrun: dryrun,
            maxPolicyCount: maxPolicies,
        });
    });

commander.program
    .command("version")
    .description("Print policy-gen version")
    .action((options) => {
        cmd_version();
    });

commander.program.parse();

