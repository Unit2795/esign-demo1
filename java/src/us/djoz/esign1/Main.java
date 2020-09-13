package us.djoz.esign1;

import com.google.gson.*;

import spark.Request;
import spark.Response;
import static spark.Spark.*;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import io.github.cdimascio.dotenv.Dotenv;

public class Main {

    static String clientID;
    static String clientSecret;
    static String corsOrigin;
    static String tokenEndpoint;
    static String folderEndpoint;
    static String captchaEndpoint;
    static String captchaSecret;

    public static Boolean validateCaptcha(String captchaResponse) {
        URL url = null;
        Boolean success = false;

        try {
            url = new URL(captchaEndpoint);

            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setDoOutput(true);
            connection.setUseCaches(false);
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            connection.setRequestProperty("Origin", corsOrigin);

            String params = String.format("secret=%s&response=%s", captchaSecret, captchaResponse);

            DataOutputStream wr = new DataOutputStream(connection.getOutputStream());
            wr.writeBytes(params);

            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                throw new RuntimeException("Failed : HTTP error code : " + connection.getResponseCode());
            }
            BufferedReader br = new BufferedReader(
                    new InputStreamReader(connection.getInputStream())
            );

            String output;
            StringBuilder response = new StringBuilder();

            while((output = br.readLine()) != null) {
                response.append(output);
            }

            JsonObject myObject = JsonParser.parseString(response.toString()).getAsJsonObject();

            success = myObject.get("success").getAsBoolean();

            connection.disconnect();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return success;
    }

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

        String sendString = "{\"folderName\":\"eSign Genie API Demo Documents\",\"templateIds\":[121195],\"fields\":{\"name\":\"%s\",\"start_date\":\"%s\",\"yes_services\":\"%s\",\"no_services\":\"%s\",\"comments\":\"%s\"},\"parties\":[{\"firstName\":\"%s\",\"lastName\":\"%s\",\"emailId\":\"%s\",\"permission\":\"FILL_FIELDS_AND_SIGN\",\"workflowSequence\":1,\"sequence\":1,\"allowNameChange\":false}],\"createEmbeddedSigningSession\":true,\"createEmbeddedSigningSessionForAllParties\":true,\"themeColor\":\"#003C1C\"}";
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

            return String.valueOf(sessionsAvailable.get(0).getAsJsonObject().get("embeddedSessionURL")).replace("\"", "");

        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./..")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        clientID = dotenv.get("ESIGN_CLIENT_ID");
        clientSecret = dotenv.get("ESIGN_CLIENT_SECRET");
        folderEndpoint = dotenv.get("FOLDER_ENDPOINT");
        tokenEndpoint = dotenv.get("TOKEN_ENDPOINT");
        corsOrigin = dotenv.get("CORS_ORIGIN");
        captchaEndpoint = dotenv.get("CAPTCHA_ENDPOINT");
        captchaSecret = dotenv.get("CAPTCHA_SECRET");


        options("/*",
                (request, response) -> {

                    String accessControlRequestHeaders = request
                            .headers("Access-Control-Request-Headers");
                    if (accessControlRequestHeaders != null) {
                        response.header("Access-Control-Allow-Headers",
                                accessControlRequestHeaders);
                    }

                    String accessControlRequestMethod = request
                            .headers("Access-Control-Request-Method");
                    if (accessControlRequestMethod != null) {
                        response.header("Access-Control-Allow-Methods",
                                accessControlRequestMethod);
                    }

                    return "OK";
                });

        before((request, response) -> response.header("Access-Control-Allow-Origin", "*"));

        post("/demoform", (request, result) -> {
            if (!validateCaptcha(request.headers("authorization")))
            {
                result.status(401);
                return "Unauthorized";
            }

            return retrieveSigningSession(retrieveAccessToken(), request, result);
        });
    }
}