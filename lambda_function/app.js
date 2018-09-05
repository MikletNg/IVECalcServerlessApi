"use strict";
const jwt = require("jsonwebtoken");
const randomBytes = require("crypto").randomBytes;
const AWS = require("aws-sdk");
var moment = require("moment-timezone");
AWS.config.update({ region: 'ap-southeast-1' });
const ddb = new AWS.DynamoDB.DocumentClient();
const randSecret = randomBytes(16).toString("hex");
const poolId = process.env.USERPOOL_ID;
var tableName = process.env.TABLE_NAME || "User";
const origin = { internal: "https://ive.miklet.pro", external: "https://myportal.vtc.edu.hk" };

exports.getDataHandler = async(et, cont) => {
    console.log(et);
    let data = JSON.parse(et.body);
    return getData(data).then(res => {
        console.log(res);
        return successResponse(res.Item, origin.external);
    }).catch(err => handleError(err, cont.awsRequestId));
};

exports.updateDataHandler = async(et, cont) => {
    console.log(et);
    let data = JSON.parse(et.body);
    return updateData(data).then(res => {
        console.log(res);
        return successResponse(res.Attributes, origin.external);
    }).catch(err => handleError(err, cont.awsRequestId));
};

exports.preConfirmedHandler = async(et, cont) => {
    console.log(et);
    return putData({ StudentId: et.request.userAttributes["custom:studentId"] }).then(res => {
        console.log(res);
    }).then(() => {
        return updateSecret(et.request.userAttributes.email);
    }).then(() => {
        return et;
    }).catch(err => handleError(err, cont.awsRequestId));
};

exports.profileHandler = async(et, cont) => {
    console.log(et);
    let data = JSON.parse(et.body);
    let decoded = jwt.decode(data.token);
    return getData({ Secret: decoded["custom:secret"], StudentId: decoded["custom:studentId"] }).then(res => {
        console.log(res);
        return successResponse(profileTable(decoded, res.Item), origin.internal);
    }).catch(err => handleError(err, cont.awsRequestId));
};

function updateSecret(username) {
    let cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    let params = {
        UserAttributes: [{
            Name: "custom:secret",
            Value: randSecret
        }],
        UserPoolId: poolId,
        Username: username
    };
    return cognitoidentityserviceprovider.adminUpdateUserAttributes(params).promise();
}

function profileTable(user, res) {
    let map = {};
    map.user_info = `<tr><td>Email:</td><td>${user.email}</td></tr><tr><td>Student ID:</td><td><span class="badge badge-info">${user["custom:studentId"]}</span></td></tr><tr><td>Secrct Key: </td><td><a href="#" class="clip-btn badge badge-dark" data-clipboard-text="${user["custom:secret"]}"><i class="far fa-copy"></i></a></td></tr>`;
    if ("dashboard" in res.Data) {
        map.highlited = "";
        for (let i in res.Data.dashboard) {
            map.highlited += `<tr><td>${res.Data.sbj[i].name}</td><td><span class="badge badge-success">${res.Data.sbj[i].att_p}</span></td><td><span class="badge badge-danger">${res.Data.sbj[i].abs_p}</span></td></tr>`;
        }
    }
    if ("sbj" in res.Data) {
        map.subjectTable = "";
        for (let i in res.Data.sbj) {
            map.subjectTable += `<tr><td>${i.t_hours}r</td><td>${i.id}</td><td>${i.att}<span class="badge badge-success">${i.att_p}</span></td><td>${i.abs}<span class="badge badge-danger">${i.abs_p}</span></td><td>${i.abg_att}</td><td>${i.remain}</td></tr>`;
        }
    }
    return map;
}

function getData(x) {
    return ddb.get({ TableName: tableName, Key: { Secret: x.Secret, StudentId: x.StudentId } }).promise();
}

function updateData(x) {
    return ddb.update({
        TableName: tableName,
        Key: { StudentId: x.StudentId, Secret: x.Secret },
        AttributeUpdates: {
            Data: {
                Value: x.Data,
                Action: "PUT"
            },
            UpdatedAt: {
                Value: moment().tz("Asia/Hong_Kong").format("MMMM Do YYYY, h:mm:ss a"),
                Action: "PUT"
            }
        },
        ReturnValues: "ALL_NEW"
    }).promise();
}

function putData(x) {
    return ddb.put({
        TableName: tableName,
        Item: {
            StudentId: x.StudentId,
            Secret: randSecret,
            Data: {},
            CreatedAt: moment().tz("Asia/Hong_Kong").format("MMMM Do YYYY, h:mm:ss a"),
            UpdatedAt: moment().tz("Asia/Hong_Kong").format("MMMM Do YYYY, h:mm:ss a")
        },
        ReturnValues: "ALL_OLD"
    }).promise();
}

function successResponse(message, origin) {
    let x = {
        "statusCode": 200,
        "body": JSON.stringify(message),
        "headers": {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "OPTIONS,POST",
            "Content-Type": "application/json"
        },
        "isBase64Encoded": false
    };
    console.log(x);
    return x;
}

function handleError(err, id) {
    console.error(err, id);
    return errorResponse(err, id);
}

function errorResponse(errorMessage, awsRequestId) {
    return {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            "Access-Control-Allow-Origin": "*",
        }
    };
}
