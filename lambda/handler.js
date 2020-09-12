'use strict';
const fetch = require("node-fetch");
const url = require('url');
const GoogleRecaptcha = require('google-recaptcha')

const googleRecaptcha = new GoogleRecaptcha({secret: process.env.CAPTCHA_SECRET})

async function validateCaptcha(token)
{
    /*googleRecaptcha.verify({response: token}, (error) => {
        if (error)
    });*/

    console.log('Beginning validation')

    const params = new url.URLSearchParams();
    params.append('secret', process.env.CAPTCHA_SECRET);
    params.append('response', token);

    let options = {
        "method": "post",
        "body": params
    };

    let tokenResult;
    try
    {
        tokenResult = await fetch(process.env.CAPTCHA_ENDPOINT, options);
    }
    catch (e) {
        console.log("Error: " + JSON.stringify(e))
    }

    let data = await tokenResult.json();

    return data.success;
}

async function retrieveAccessToken()
{
    const params = new url.URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.ESIGN_CLIENT_ID);
    params.append('client_secret', process.env.ESIGN_CLIENT_SECRET);
    params.append('scope', 'read-write');

    let tokenOptions =
        {
            "method": "post",
            "headers": {
                "Origin": process.env.CORS_ORIGIN
            },
            "body": params
        };

    let tokenResult = await fetch(process.env.TOKEN_ENDPOINT, tokenOptions);

    let data = await tokenResult.json();

    return (`Bearer ${data.access_token}`);
}

async function retrieveSigningSession(token, parameters)
{
    let fullName = parameters.fname + " " + parameters.lname;

    let body = JSON.stringify({
        "folderName":"eSign Genie API Demo Documents",
        "templateIds":[121195],
        "fields":
            {
                "name": fullName,
                "start_date": parameters.start,
                "yes_services": parameters.services ? "true" : "false",
                "no_services": parameters.services ? "false" : "true",
                "comments": parameters.comments
            },
        "parties": [
            {
                "firstName": parameters.fname,
                "lastName": parameters.lname,
                "emailId": parameters.email,
                "permission":"FILL_FIELDS_AND_SIGN",
                "workflowSequence":1,
                "sequence":1,
                "allowNameChange":false
            }
        ],
        "createEmbeddedSigningSession": true,
        "createEmbeddedSigningSessionForAllParties": true,
        "themeColor": "#80ff80"
    });

    let options =
        {
            "method": "post",
            "headers": {
                "Origin": process.env.CORS_ORIGIN,
                "Authorization": token,
                "Content-Type": "application/json"
            },
            "body": body
        };

    let embedResult = await fetch(process.env.FOLDER_ENDPOINT, options);

    let jsonRes = await embedResult.json();

    /*if (jsonRes.embeddedSigningSessions.length === 0)
    {
        return "";
    }*/

    return JSON.stringify(jsonRes);
}


module.exports.hello = async event => {
    const parsed = JSON.parse(event.body);



    if (!await validateCaptcha(event.headers.Authorization))
    {
        return {
            statusCode: 401,
            headers: {
                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: 'Unauthorized'
        }
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: await retrieveSigningSession(await retrieveAccessToken(), parsed)
    };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
