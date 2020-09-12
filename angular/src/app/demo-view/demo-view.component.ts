import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-demo-view',
  templateUrl: './demo-view.component.html',
  styleUrls: ['./demo-view.component.sass']
})
export class DemoViewComponent implements OnInit {
  languages = [
    {
      name: 'Java',
      snippet: `
      public static String retrieveAccessToken() {
          URL url = null;
          String accessToken = "";

          try {
              url = new URL(tokenEndpoint);

              HttpURLConnection connection = (HttpURLConnection) url.openConnection();

              connection.setDoOutput(true);
              connection.setUseCaches(false);
              connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
              connection.setRequestProperty("Origin", corsOrigin);


              String params = String.format("grant_type=client_credentials&client_id=%s&client_secret=%s&scope=read-write", clientID, clientSecret);

              DataOutputStream wr = new DataOutputStream(connection.getOutputStream());
              wr.writeBytes(params);

              if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                  throw new RuntimeException("Failed : HTTP error code : " + connection.getResponseCode());
              }
              BufferedReader br = new BufferedReader(
                      new InputStreamReader(connection.getInputStream())
              );

              String output;
              StringBuffer response = new StringBuffer();

              while((output = br.readLine()) != null) {
                  response.append(output);
              }

              JsonObject myObject = JsonParser.parseString(response.toString()).getAsJsonObject();

              accessToken = myObject.get("access_token").getAsString();

              connection.disconnect();

          } catch (MalformedURLException e) {
              e.printStackTrace();
          } catch (IOException e) {
              e.printStackTrace();
          }


          return ("Bearer " + accessToken);
      }

      public static String retrieveSigningSession(String token, Request request, Response result) {
          URL url = null;
          String sessionUrl = "";
          JsonObject myObject = JsonParser.parseString(request.body()).getAsJsonObject();

          String fullName = myObject.get("fname").getAsString() + " " + myObject.get("lname").getAsString();;

          String sendString = "{\\"folderName\\":\\"eSign Genie API Demo Documents\\",\\"templateIds\\":[121195],\\"fields\\":{\\"name\\":\\"%s\\",\\"start_date\\":\\"%s\\",\\"yes_services\\":\\"%s\\",\\"no_services\\":\\"%s\\",\\"comments\\":\\"%s\\"},\\"parties\\":[{\\"firstName\\":\\"%s\\",\\"lastName\\":\\"%s\\",\\"emailId\\":\\"%s\\",\\"permission\\":\\"FILL_FIELDS_AND_SIGN\\",\\"workflowSequence\\":1,\\"sequence\\":1,\\"allowNameChange\\":false}],\\"createEmbeddedSigningSession\\":true,\\"createEmbeddedSigningSessionForAllParties\\":true,\\"themeColor\\":\\"#80ff80\\"}";
          String populatedSendString = String.format(
                  sendString,
                  fullName,
                  myObject.get("start").getAsString(),
                  (myObject.get("services").getAsBoolean() ? "true" : "false"),
                  (!myObject.get("services").getAsBoolean() ? "true" : "false"),
                  myObject.get("comments").getAsString(),
                  myObject.get("fname").getAsString(),
                  myObject.get("lname").getAsString(),
                  myObject.get("email").getAsString()
          );

          try {
              url = new URL(folderEndpoint);

              HttpURLConnection connection = (HttpURLConnection) url.openConnection();

              connection.setDoOutput(true);
              connection.setUseCaches(false);
              connection.setRequestProperty("Content-Type", "application/json");
              connection.setRequestProperty("Origin", corsOrigin);
              connection.setRequestProperty("Authorization", token);


              try(OutputStream os = connection.getOutputStream()) {
                  byte[] input = populatedSendString.getBytes(StandardCharsets.UTF_8);
                  os.write(input, 0, input.length);
              }

              if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                  throw new RuntimeException("Failed : HTTP error code : " + connection.getResponseCode());
              }

              StringBuilder response = new StringBuilder();

              try(BufferedReader br = new BufferedReader(
                      new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                  String responseLine = null;
                  while ((responseLine = br.readLine()) != null) {
                      response.append(responseLine.trim());
                  }
              }


              JsonObject responseObject = JsonParser.parseString(response.toString()).getAsJsonObject();

              JsonArray sessionsAvailable = responseObject.get("embeddedSigningSessions").getAsJsonArray();

              if(sessionsAvailable.size() == 0)
              {
                  return "";
              }

              connection.disconnect();

              return String.valueOf(sessionsAvailable.get(0).getAsJsonObject().get("embeddedSessionURL")).replace("\\"", "");

          } catch (MalformedURLException e) {
              e.printStackTrace();
          } catch (IOException e) {
              e.printStackTrace();
          } catch (Exception e) {
              e.printStackTrace();
          }

          return "";
      }
      `
    },
    {
      name: "Kotlin",
      snippet: `
      fun retrieveSigningSession(token: String, request: Request, result: Response): String {
          val myObject = JsonParser.parseString(request.body()).asJsonObject

          val fullName: String = myObject.get("fname").asString + " " + myObject.get("lname").asString

          val sendString = "{\\"folderName\\":\\"eSign Genie API Demo Documents\\",\\"templateIds\\":[121195],\\"fields\\":{\\"name\\":\\"%s\\",\\"start_date\\":\\"%s\\",\\"yes_services\\":\\"%s\\",\\"no_services\\":\\"%s\\",\\"comments\\":\\"%s\\"},\\"parties\\":[{\\"firstName\\":\\"%s\\",\\"lastName\\":\\"%s\\",\\"emailId\\":\\"%s\\",\\"permission\\":\\"FILL_FIELDS_AND_SIGN\\",\\"workflowSequence\\":1,\\"sequence\\":1,\\"allowNameChange\\":false}],\\"createEmbeddedSigningSession\\":true,\\"createEmbeddedSigningSessionForAllParties\\":true,\\"themeColor\\":\\"#80ff80\\"}"
          val populatedSendString = String.format(
                  sendString,
                  fullName,
                  myObject.get("start").asString,
                  if (myObject.get("services").asBoolean) "true" else "false",
                  if (!myObject.get("services").asBoolean) "true" else "false",
                  myObject.get("comments").asString,
                  myObject.get("fname").asString,
                  myObject.get("lname").asString,
                  myObject.get("email").asString
          )

          val response = StringBuffer()

          URL(folderEndpoint)
                  .openConnection()
                  .let {
                      it as HttpURLConnection
                  }
                  .apply {
                      setRequestProperty("Content-Type", "application/json")
                      setRequestProperty("Origin", corsOrigin)
                      setRequestProperty("Authorization", token)
                      requestMethod = "POST"
                      doOutput = true
                      useCaches = false

                      val output = OutputStreamWriter(outputStream)
                      output.write(populatedSendString, 0, populatedSendString.length)
                      output.flush()
                  }
                  .let {
                      if (it.responseCode == 200) it.inputStream else it.errorStream
                  }
                  .let { streamToRead ->
                      BufferedReader(InputStreamReader(streamToRead)).use {


                          var inputLine = it.readLine()
                          while (inputLine != null) {
                              response.append(inputLine)
                              inputLine = it.readLine()
                          }
                          it.close()
                          response.toString()
                      }
                  }

          val outputObject = JsonParser.parseString(response.toString()).asJsonObject

          val sessionsAvailable = outputObject.get("embeddedSigningSessions").asJsonArray

          return if (sessionsAvailable.size() == 0) {
              ""
          } else sessionsAvailable[0].asJsonObject["embeddedSessionURL"].toString().replace("\\"", "")

      }

      fun retrieveAccessToken(): String {
          val params = String.format("grant_type=client_credentials&client_id=%s&client_secret=%s&scope=read-write", clientID, clientSecret)

          val response = StringBuffer()

          URL(tokenEndpoint)
                  .openConnection()
                  .let {
                      it as HttpURLConnection
                  }
                  .apply {
                      setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
                      setRequestProperty("Origin", corsOrigin)
                      requestMethod = "POST"
                      doOutput = true
                      useCaches = false

                      val output = OutputStreamWriter(outputStream)
                      output.write(params)
                      output.flush()
                  }
                  .let {
                      if (it.responseCode == 200) it.inputStream else it.errorStream
                  }
                  .let { streamToRead ->
                      BufferedReader(InputStreamReader(streamToRead)).use {


                          var inputLine = it.readLine()
                          while (inputLine != null) {
                              response.append(inputLine)
                              inputLine = it.readLine()
                          }
                          it.close()
                          response.toString()
                      }
                  }

          val myObject = JsonParser.parseString(response.toString()).asJsonObject

          return("Bearer " + myObject.get("access_token").asString)
      }
      `
    },
    {
      name: 'cURL',
      snippet: `
      curl --location --request POST 'https://www.esigngenie.com/esign/api/oauth2/access_token' \\
      --header 'Origin: http://yourwebsite.com' \\
      --header 'Content-Type: application/x-www-form-urlencoded' \\
      --data-urlencode 'grant_type=client_credentials' \\
      --data-urlencode 'client_id=CLIENT_ID' \\
      --data-urlencode 'client_secret=CLIENT_SECRET' \\
      --data-urlencode 'scope=read-write'
      `
    },
    {
      name: 'Typescript',
      snippet: `
      async function retrieveToken()
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

          if (jsonRes.embeddedSigningSessions.length === 0)
          {
              return result.sendStatus(400);
          }

          return jsonRes.embeddedSigningSessions[0].embeddedSessionURL;
      }
      `
    },
    {
      name: 'C#',
      snippet: ``
    },
    {
      name: 'PHP',
      snippet: ``
    }
  ];
  activeIndex: number = 0;
  activeLanguage: number = 0;
  demoForm = new FormGroup({
    fname: new FormControl(''),
    lname: new FormControl(''),
    start: new FormControl(''),
    email: new FormControl(''),
    comments: new FormControl(''),
    services: new FormControl('false')
  });
  signingUrl: string = '';


  constructor() { }

  ngOnInit(): void {
    document.addEventListener('DOMContentLoaded', (event) => {
      document.querySelectorAll('pre code').forEach((block) => {
        // @ts-ignore
        hljs.highlightBlock(block);
      });
    });
  }

  setActiveLanguage(event: any)
  {
    this.activeLanguage = parseInt(event.target.value);
  }

  setActiveIndex(index: number)
  {
    this.activeIndex = index;
  }

  async submitForm(event: any) {
    if (this.demoForm.value.fname.trim().length < 1 || this.demoForm.value.lname.trim().length < 1)
    {
      return alert('Please provide your name');
    }
    else if (this.demoForm.value.email.trim().length < 3)
    {
      return alert('Please provide a valid email address');
    }

    let formattedDate = "";
    if (this.demoForm.value.start !== "")
    {
      let {_d} = this.demoForm.value.start;
      formattedDate = `${(_d.getMonth() + 1)}-${(_d.getDate())}-${(_d.getFullYear())}`;
    }


    let body = JSON.stringify({
      "fname": this.demoForm.value.fname,
      "lname": this.demoForm.value.lname,
      "start": formattedDate,
      "services": this.demoForm.value.lname,
      "email": this.demoForm.value.email,
      "comments": this.demoForm.value.comments
    });
    // @ts-ignore
    let token = grecaptcha.getResponse();


    let options = {
      "method": "post",
      "headers": {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      "body": body
    };

    let response;
    try {
      response = await fetch('http://localhost:4567/demoform', options);
    }
    catch (e) {
      return alert("Request failed");
    }

    let url = await response.text();

    console.log(url);
    this.signingUrl = url;
    document.getElementById('esignIframe').setAttribute('src', url);
  }

  clearSigning() {
    this.signingUrl = ''
  }
}
