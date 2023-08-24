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

