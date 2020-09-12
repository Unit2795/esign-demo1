using System;
using System.Net.Http;
using System.Threading.Tasks;
using dotenv.net;
using dotenv.net.Utilities;
using Nancy;
using Flurl;
using Flurl.Http;
using Nancy.Extensions;
using Newtonsoft.Json;

namespace csharp
{
    public class PrepareSession : NancyModule
    {
        private static readonly HttpClient client = new HttpClient();

        static async Task<bool> validateCaptcha(string token)
        {
            var envReader = new EnvReader();
            
            var success = false;

            var responseString = await envReader.GetStringValue("CAPTCHA_ENDPOINT")
                .PostUrlEncodedAsync(new
                {
                    secret = envReader.GetStringValue("CAPTCHA_SECRET"),
                    response = token
                }).ReceiveString();
            
            dynamic responseJson = JsonConvert.DeserializeObject(responseString);

            return responseJson.success;
        }

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
                        'themeColor': '#80ff80'
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

        public PrepareSession()
        {
            string path = @"E:\esign-demo1\.env";
            DotEnv.Config(true, path);

            Post("/demoform", async _ => {
                if (!await validateCaptcha(this.Request.Headers.Authorization))
                {
                    return new Response
                    {
                        StatusCode = HttpStatusCode.Unauthorized, ReasonPhrase = "Unauthorized"
                    };
                }
                var token = await RetrieveAccessToken();
                return await RetrieveSigningSession(token, this.Request, this.Response);
            });
        }
    }
}