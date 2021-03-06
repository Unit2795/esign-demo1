import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.sass']
})
export class LanguagesComponent implements OnInit {
  languages = [
    {
      name: 'cURL',
      token: `
      curl --location --request POST 'https://www.esigngenie.com/esign/api/oauth2/access_token' \\
      --header 'Origin: <YOUR_WEBSITE_URL>' \\
      --header 'Content-Type: application/x-www-form-urlencoded' \\
      --data-urlencode 'grant_type=client_credentials' \\
      --data-urlencode 'client_id=<CLIENT_ID>' \\
      --data-urlencode 'client_secret=<CLIENT_SECRET>' \\
      --data-urlencode 'scope=read-write'
      `,
      signing: `
      curl --location --request POST 'https://www.esigngenie.com/esign/api/templates/createFolder' \\
      --header 'Origin: http://localhost:8000' \\
      --header 'Authorization: Bearer <MY_ACCESS_TOKEN>' \\
      --header 'Content-Type: application/json' \\
      --data-raw '{
          "folderName":"Sample Documents",
        "templateIds":[121195],
          "fields":
          {
                "name": "<FULL_NAME>",
                "start_date": "<START_DATE>",
                "yes_services": "<YES_SERVICES>",
                "no_services": "<NO_SERVICES>"
          },
          "parties": [
              {
            "firstName": "<FIRST_NAME>",
            "lastName": "<LAST_NAME>",
            "emailId": "<EMAIL_ADDRESS>",
            "permission":"FILL_FIELDS_AND_SIGN",
            "workflowSequence":1,
            "sequence":1,
            "allowNameChange":false
          }
          ]
      }'
      `
    },
    {
      name: 'C#',
      token: `
      static async Task<string> RetrieveAccessToken()
      {
          var envReader = new EnvReader();

          var responseString = await envReader.GetStringValue("TOKEN_ENDPOINT")
              .PostUrlEncodedAsync(new
              {
                  grant_type = "client_credentials",
                  client_id = envReader.GetStringValue("ESIGN_CLIENT_ID"),
                  client_secret = envReader.GetStringValue("ESIGN_CLIENT_SECRET"),
                  scope = "read-write"
              }).ReceiveString();

          dynamic responseJson = JsonConvert.DeserializeObject(responseString);

          return "Bearer " + responseJson.access_token;
      }
      `,
      signing: `
      static async Task<string> RetrieveSigningSession(string token, Request request, IResponseFormatter response)
      {
            var envReader = new EnvReader();

            dynamic inc = JsonConvert.DeserializeObject(request.Body.AsString());

            var fullName = inc.fname + " " + inc.lname;

            var yesServices = (inc.services == "True" ? "true" : "false");
            var noServices = (inc.services == "True"  ? "false" : "true");

            var json = $@"
            {{
                    'folderName':'eSign Genie API Demo Documents',
                    'templateIds':[121195],
                    'fields':
                    {{
                        'name': '{fullName}',
                        'start_date': '{inc.start}',
                        'yes_services': '{yesServices}',
                        'no_services': '{noServices}',
                        'comments': '{inc.comments}'
                    }},
                    'parties': [
                        {{
                            'firstName': '{inc.fname}',
                            'lastName': '{inc.lname}',
                            'emailId': '{inc.email}',
                            'permission':'FILL_FIELDS_AND_SIGN',
                            'workflowSequence':1,
                            'sequence':1,
                            'allowNameChange':false
                        }}
                    ],
                    'createEmbeddedSigningSession': true,
                    'createEmbeddedSigningSessionForAllParties': true,
                    'themeColor': '#003C1C'
            }}
            ";


            var responseString = new Flurl.Url(envReader.GetStringValue("FOLDER_ENDPOINT"));
            try
            {
                responseString = await envReader.GetStringValue("FOLDER_ENDPOINT")
                    .WithHeader("Authorization", token)
                    .PostJsonAsync(JsonConvert.DeserializeObject(json))
                    .ReceiveString();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }


            dynamic responseJson = JsonConvert.DeserializeObject(responseString);

            return responseJson.embeddedSigningSessions[0].embeddedSessionURL;
        }
      `
    },
    {
      name: 'Java',
      token: `
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
      `,
      signing: `
      public static String retrieveSigningSession(String token, Request request, Response result) {
          URL url = null;
          String sessionUrl = "";
          JsonObject myObject = JsonParser.parseString(request.body()).getAsJsonObject();

          String fullName = myObject.get("fname").getAsString() + " " + myObject.get("lname").getAsString();;

          String sendString = "{\\"folderName\\":\\"eSign Genie API Demo Documents\\",\\"templateIds\\":[121195],\\"fields\\":{\\"name\\":\\"%s\\",\\"start_date\\":\\"%s\\",\\"yes_services\\":\\"%s\\",\\"no_services\\":\\"%s\\",\\"comments\\":\\"%s\\"},\\"parties\\":[{\\"firstName\\":\\"%s\\",\\"lastName\\":\\"%s\\",\\"emailId\\":\\"%s\\",\\"permission\\":\\"FILL_FIELDS_AND_SIGN\\",\\"workflowSequence\\":1,\\"sequence\\":1,\\"allowNameChange\\":false}],\\"createEmbeddedSigningSession\\":true,\\"createEmbeddedSigningSessionForAllParties\\":true,\\"themeColor\\":\\"#003C1C\\"}";
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
      token: `
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
      `,
      snippet: `
      fun retrieveSigningSession(token: String, request: Request, result: Response): String {
          val myObject = JsonParser.parseString(request.body()).asJsonObject

          val fullName: String = myObject.get("fname").asString + " " + myObject.get("lname").asString

          val sendString = "{\\"folderName\\":\\"eSign Genie API Demo Documents\\",\\"templateIds\\":[121195],\\"fields\\":{\\"name\\":\\"%s\\",\\"start_date\\":\\"%s\\",\\"yes_services\\":\\"%s\\",\\"no_services\\":\\"%s\\",\\"comments\\":\\"%s\\"},\\"parties\\":[{\\"firstName\\":\\"%s\\",\\"lastName\\":\\"%s\\",\\"emailId\\":\\"%s\\",\\"permission\\":\\"FILL_FIELDS_AND_SIGN\\",\\"workflowSequence\\":1,\\"sequence\\":1,\\"allowNameChange\\":false}],\\"createEmbeddedSigningSession\\":true,\\"createEmbeddedSigningSessionForAllParties\\":true,\\"themeColor\\":\\"#003C1C\\"}"
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
      `
    },
    {
      name: 'PHP',
      token: `
      <?php
      function retrieveAccessToken() {
          $response = Http::asForm() -> withHeaders([
              "Origin" => env("CORS_ORIGIN")
          ]) -> post(env("TOKEN_ENDPOINT"), [
              "grant_type" => "client_credentials",
              "client_id" => env("ESIGN_CLIENT_ID"),
              "client_secret" => env("ESIGN_CLIENT_SECRET"),
              "scope" => "read-write"
          ]);

          return "Bearer " . json_decode($response->body())->{'access_token'};
      }
      ?>
      `,
      signing: `
      <?php
      function retrieveSigningSession($token, $request, $response) {
          $data = json_decode($request->getContent());

          $firstName = $data->{"fname"};
          $lastName = $data->{"lname"};
          $fullName = $data->{"fname"} . " " . $data->{"lname"};
          $startDate = $data->{"start"};
          $yesServices = $data->{"services"} ? "true" : "false";
          $noServices = $data->{"services"} ? "false" : "true";
          $email = $data->{"email"};
          $comments = $data->{"comments"};

          $sendString = "{\\"folderName\\":\\"eSign Genie API Demo Documents\\",\\"templateIds\\":[121195],\\"fields\\":{\\"name\\":\\"$fullName\\",\\"start_date\\":\\"$startDate\\",\\"yes_services\\":\\"$yesServices\\",\\"no_services\\":\\"$noServices\\",\\"comments\\":\\"$comments\\"},\\"parties\\":[{\\"firstName\\":\\"$firstName\\",\\"lastName\\":\\"$lastName\\",\\"emailId\\":\\"$email\\",\\"permission\\":\\"FILL_FIELDS_AND_SIGN\\",\\"workflowSequence\\":1,\\"sequence\\":1,\\"allowNameChange\\":false}],\\"createEmbeddedSigningSession\\":true,\\"createEmbeddedSigningSessionForAllParties\\":true,\\"themeColor\\":\\"#003C1C\\"}";

          $createResponse = Http::withHeaders([
              "Origin" => env('CORS_ORIGIN'),
              "Authorization" => $token
          ]) -> post(env("FOLDER_ENDPOINT"), \\GuzzleHttp\\json_decode($sendString, true));

          return json_decode($createResponse->body())->{"embeddedSigningSessions"}[0]->{"embeddedSessionURL"};
      }
      ?>
      `
    },
    {
      name: 'Typescript',
      token: `
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
      `,
      signing: `
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
      `
    }
  ];

  activeLanguage: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  setActiveLanguage(event: any)
  {
    this.activeLanguage = parseInt(event.target.value);
  }

  @Input() activeIndex: number;
}
