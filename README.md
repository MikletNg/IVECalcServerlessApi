# IVE Att & Abs Calculator Api

This is a sample template for sam-app - Below is a brief explanation of what we have generated for you:

```bash
.
├── README.md                   <-- This instructions file
├── lambda_function                 <-- Source code for a lambda function
│   ├── app.js                  <-- Lambda function code
│   ├── package.json            <-- NodeJS dependencies
└── template.yaml               <-- SAM template
```
## Setup process

### Installing dependencies

In this project we use `npm` but you can use `yarn` if you prefer to manage NodeJS dependencies:

```bash
cd hello_world
npm install
cd ../
```
Next, run the following command to package our Lambda function to S3 and create a Cloudformation Stack and deploy your SAM resources.

```bash
sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket ive-calc-serverless &&
sam deploy \
    --template-file packaged.yaml \
    --stack-name IVECalcServerless \
    --capabilities CAPABILITY_IAM \
    --region ap-southeast-1
```

> **See [Serverless Application Model (SAM) HOWTO Guide](https://github.com/awslabs/serverless-application-model/blob/master/HOWTO.md) for more details in how to get started.**

After deployment is complete you can run the following command to retrieve the API Gateway Endpoint URL:

```bash
aws cloudformation describe-stacks \
    --stack-name sam-app \
    --query 'Stacks[].Outputs'
``` 

## Testing

We use `mocha` for testing our code and it is already added in `package.json` under `scripts`, so that we can simply run the following command to run our tests:

```bash
cd hello_world
npm run test
```

# Appendix

## AWS CLI commands

AWS CLI commands to package, deploy and describe outputs defined within the cloudformation stack:

```bash
sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket REPLACE_THIS_WITH_YOUR_S3_BUCKET_NAME

sam deploy \
    --template-file packaged.yaml \
    --stack-name sam-app \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides MyParameterSample=MySampleValue

aws cloudformation describe-stacks \
    --stack-name sam-app --query 'Stacks[].Outputs'
```

**NOTE**: Alternatively this could be part of package.json scripts section.

## Bringing to the next level

Here are a few ideas that you can use to get more acquainted as to how this overall process works:

* Create an additional API resource (e.g. /hello/{proxy+}) and return the name requested through this new path
* Update unit test to capture that
* Package & Deploy

Next, you can use the following resources to know more about beyond hello world samples and how others structure their Serverless applications:

* [AWS Serverless Application Repository](https://aws.amazon.com/serverless/serverlessrepo/)
