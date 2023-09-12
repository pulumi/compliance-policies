import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";


for (let y = 0; y < 100; y++) {
    const sg = new aws.ec2.SecurityGroup(`perf-sg-${y}`, {
        tags: {
            counter: `${y}`,
        }
    });
}
