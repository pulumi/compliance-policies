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

import { ResourceValidationArgs } from "@pulumi/policy";
import { createResourceValidationArgs } from "@pulumi/unit-test-helpers";
import { PipelineTopology } from "@pulumi/azure-native/videoanalyzer/v20211101preview";

/**
 * Create a `ResourceValidationArgs` to be process by the unit test.
 *
 * @returns A `ResourceValidationArgs`.
 */
export function getResourceValidationArgs(): ResourceValidationArgs {
    return createResourceValidationArgs(PipelineTopology, {
        accountName: "",
        kind: "",
        resourceGroupName: "",
        sinks: [
            {
                inputs: [
                    {
                        nodeName: "",
                    },
                ],
                name: "",
                type: "#Microsoft.VideoAnalyzer.VideoSink",
                videoName: "",
            },
        ],
        sku: {
            name: "",
        },
        sources: [
            {
                endpoint: {
                    credentials: {
                        password: "",
                        type: "#Microsoft.VideoAnalyzer.UsernamePasswordCredentials",
                        username: "",
                    },
                    type: "#Microsoft.VideoAnalyzer.TlsEndpoint",
                    url: "",
                },
                name: "",
                type: "#Microsoft.VideoAnalyzer.RtspSource",
            },
        ],
    });
}
