# IVE Att & Abs Calculator Api

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
cd lambda_function
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

Then, go Cognito user pool config the trigger of `Post confirmation` to `IvePreConfirmed`.
