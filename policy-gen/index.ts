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

/**
 * An entrypoint.
 *
 * @param provider The name of a pulumi provider.
 */
function cmd_run(name: string, version: string, directory: string) {

    const provider = new KubernetesProvider({
        name: name,
        version: version,
        directory: directory,
        overwrite: false,
    });
    provider.generatePolicies();

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
    .requiredOption("-p, --provider <providers>", "The desired Pulumi provider to generate policies for.")
    .requiredOption("-v, --version <version>", "The provider version to process.")
    .requiredOption("-d, --directory <vendor-directory>", "Path to the vendor's directory to save the generated polcies.")
    .action((options) => {
        const name: string = (options.provider as string);
        const version: string = (options.version as string);
        const directory: string = (options.directory as string);

        cmd_run(name, version, directory);
    });

commander.program
    .command("version")
    .description("Print policy-gen version")
    .action((options) => {
        cmd_version();
    });

commander.program.parse();

