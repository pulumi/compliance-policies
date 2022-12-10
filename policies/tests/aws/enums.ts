// Copyright 2016-2022, Pulumi Corporation.
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

export const accountId: string = "123456781234";
export const region: string = "us-west-2";

export enum acm {
    certificateArn = "arn:aws:acm:us-west-2:123456781234:certificate/1234abcd-12ab-34cd-56ef-1234567890ab",
}

export enum apigatewayv2 {
    apiId = "a1b2c3d4",
    accessLogFormat = "$context.extendedRequestId $context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] $context.httpMethod $context.resourcePath $context.protocol $context.status $context.responseLength $context.requestId",
}

export enum cloudwatch {
    logGroupArn = "arn:aws:logs:us-west-2:123456781234:log-group:log-group-name",
}

export enum kms {
    keyId = "key/1234abcd-12ab-34cd-56ef-1234567890ab",
    keyArn = "arn:aws:kms:us-west-2:123456781234:key/1234abcd-12ab-34cd-56ef-1234567890ab",
}
