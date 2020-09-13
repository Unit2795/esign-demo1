import Express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';


// Random stuff to  initialize and configure.
let app = Express();
app.use(cors());
app.use(bodyParser.json());
const port = 4567;
let router = Express.Router();

async function validateCaptcha(token: string)
{
    const params = new URLSearchParams();
    params.append('secret', process.env.CAPTCHA_SECRET);
    params.append('response', token);

    let options = {
        "method": "post",
        "headers": {
            "Origin": process.env.CORS_ORIGIN
        },
        "body": params
    };

    let tokenResult = await fetch(process.env.CAPTCHA_ENDPOINT, options);

    let data = await tokenResult.json();

    return data.success;
}

async function retrieveAccessToken()
{
    const params = new URLSearchParams();
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

    return ("Bearer " + data.access_token);
}

async function retrieveSigningSession(token, request, result)
{
    let fullName = request.body.fname + " " + request.body.lname;

    let body = JSON.stringify({
        "folderName":"eSign Genie API Demo Documents",
        "templateIds":[121195],
        "fields":
            {
                "name": fullName,
                "start_date": request.body.start,
                "yes_services": request.body.services ? "true" : "false",
                "no_services": request.body.services ? "false" : "true",
                "comments": request.body.comments
            },
        "parties": [
            {
                "firstName": request.body.fname,
                "lastName": request.body.lname,
                "emailId": request.body.email,
                "permission":"FILL_FIELDS_AND_SIGN",
                "workflowSequence":1,
                "sequence":1,
                "allowNameChange":false
            }
        ],
        "createEmbeddedSigningSession": true,
        "createEmbeddedSigningSessionForAllParties": true,
        "themeColor": "#003C1C"
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

    if (jsonRes.embeddedSigningSessions.length === 0)
    {
        return result.sendStatus(400);
    }

    return jsonRes.embeddedSigningSessions[0].embeddedSessionURL;
}

app.post('/demoform', async function (request, result) {
    if (!await validateCaptcha(request.headers['authorization']))
    {
        return result.sendStatus(401);
    }

    let token = await retrieveAccessToken();

    let url = await retrieveSigningSession(token, request, result);

    result.send(url);
});

app.use('/', router, function (request, result) {
    result.send('Hello World!');
});

app.listen(port);