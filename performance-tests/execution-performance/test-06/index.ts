import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

for (let y = 0; y < 100; y++) {
    const bucket = new aws.s3.Bucket(`my-bucket-${y}`, {
    tags: {
            counter: `${y}`,
        }
    });
}
