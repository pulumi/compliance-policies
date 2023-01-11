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

export enum root {
    region = "us-west-2",
    availabilityZone1 = "us-west-2a",
    availabilityZone2 = "us-west-2b",
    accountId = "123456789012",
}

export enum acm {
    certificateArn = "arn:aws:acm:us-west-2:123456789012:certificate/1234abcd-12ab-34cd-56ef-1234567890ab",
}

export enum alb {
    loadBalancerArn = "arn:aws:elasticloadbalancing:us-west-2:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188",
    targetGroupArn = "arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/my-targets/73e2d6bc24d8a067",
}

export enum apigatewayv2 {
    apiId = "a1b2c3d4",
    accessLogFormat = "$context.extendedRequestId $context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] $context.httpMethod $context.resourcePath $context.protocol $context.status $context.responseLength $context.requestId",
}

export enum cloudfront {
    originId = "text-DAddwekjfwoijdw-example"
}

export enum cloudwatch {
    logGroupArn = "arn:aws:logs:us-west-2:123456789012:log-group:log-group-name",
}

export enum ec2 {
    imageId = "ami-12345678",
    instanceType = "t2-micro",
    vpcSecurityGroupId = "sg-12345678",
    vpcId = "vpc-12345678",
    cidrBlock = "10.0.0.0/8",
    ipv6CidrBlock = "fd29:be60:c157:350f::/64",
    subnetId1 = "subnet-0a8c929d00b5373c1",
    subnetId2 = "subnet-01969596cadb0d862",
}

export enum iam {
    roleArn = "arn:aws:iam::123456789012:role/aws-iam-role-12345678",
    sslCertificateArn = "arn:aws:iam::123456789012:server-certificate/certName",
}

export enum kms {
    keyId = "key/1234abcd-12ab-34cd-56ef-1234567890ab",
    keyArn = "arn:aws:kms:us-west-2:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab",
}

export enum lambda {
    functionArn = "arn:aws:lambda:us-west-2:123456789012:function:my-lambda-function",
}

export enum rds {
    dbClusterIdentifier = "mydbcluster",
}

export enum s3 {
    bucketRegionalDomainName = "example-bucket.s3.us-west-2.amazonaws.com",
    bucketId = "example-bucket",
}

export enum secretsmanager {
    secretArn = "arn:aws:secretsmanager:us-west-2:123456789012:secret:MyTestSecret-Ca8JGt",
}

export enum sns {
    arn = "arn:aws:sns:us-west-2:123456789012:MyTopic",
}

export enum waf {
    webAclArn = "arn:aws:wafv2:us-east-1:123456789012:global/webacl/ExampleWebACL/1234abcd-12ab-34cd-56ef-1234567890ab",
}
