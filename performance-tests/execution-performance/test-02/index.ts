const startTime = new Date();

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const postImportStartTime = new Date();

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket");

// Export the name of the bucket
export const bucketName = bucket.id;
const stopTime = new Date();

const endToEndExecutionTime = stopTime.getTime() - startTime.getTime();
const postImportEndExecutionTime = stopTime.getTime() - postImportStartTime.getTime();

// import * as fs from 'fs';

// const data = [{
//     runetimetime: postImportEndExecutionTime,
//     executiontime: endToEndExecutionTime,
// }];

// const filePath = 'data.tsv';

// if (!fs.existsSync(filePath)) {
//     const headers = Object.keys(data[0]).join(--policy-pack ../packs/aws-premium-policies/) + '\n';
//     fs.writeFileSync(filePath, headers);
// }
// data.forEach((item) => {
//     const row = Object.values(item).join("\t") + '\n';
//     fs.appendFileSync(filePath, row);
// });

// console.log(`Runtime time: ${postImportEndExecutionTime} milliseconds`);
// console.log(`Execution time: ${endToEndExecutionTime} milliseconds`);
