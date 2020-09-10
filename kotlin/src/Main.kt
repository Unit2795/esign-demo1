import com.google.gson.JsonParser
import io.github.cdimascio.dotenv.dotenv
import spark.Filter
import spark.Request
import spark.Response
import spark.Spark
import spark.kotlin.post
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL


val dotenv = dotenv {
    directory = "./.."
    ignoreIfMalformed = true
    ignoreIfMissing = true
}

val clientID = dotenv["ESIGN_CLIENT_ID"]
val clientSecret = dotenv["ESIGN_CLIENT_SECRET"]
val corsOrigin = dotenv["CORS_ORIGIN"]
val tokenEndpoint = dotenv["TOKEN_ENDPOINT"]
val folderEndpoint = dotenv["FOLDER_ENDPOINT"]
val captchaEndpoint = dotenv["CAPTCHA_ENDPOINT"]
val captchaSecret = dotenv["CAPTCHA_SECRET"]

fun main(args: Array<String>) {

    Spark.options("/*"
    ) { request: Request, response: Response ->
        val accessControlRequestHeaders = request
                .headers("Access-Control-Request-Headers")
        if (accessControlRequestHeaders != null) {
            response.header("Access-Control-Allow-Headers",
                    accessControlRequestHeaders)
        }
        val accessControlRequestMethod = request
                .headers("Access-Control-Request-Method")
        if (accessControlRequestMethod != null) {
            response.header("Access-Control-Allow-Methods",
                    accessControlRequestMethod)
        }
        "OK"
    }

    Spark.before(Filter { request: Request?, response: Response -> response.header("Access-Control-Allow-Origin", "*") })

    post("/demoform") {
        var returnVal = "";
        returnVal = if (!validateCaptcha(request.headers("authorization"))) {
            response.status(401)
            "Unauthorized"
        }
        else
        {
            retrieveSigningSession(retrieveAccessToken(), request, response)
        }
        returnVal
    }
}

fun validateCaptcha(captchaResponse: String): Boolean {
    val params = String.format("secret=%s&response=%s", captchaSecret, captchaResponse)

    val response = StringBuffer()

    URL(captchaEndpoint)
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

    return(myObject.get("success").asBoolean)
}

fun retrieveSigningSession(token: String, request: Request, result: Response): String {
    val myObject = JsonParser.parseString(request.body()).asJsonObject

    val fullName: String = myObject.get("fname").asString + " " + myObject.get("lname").asString

    val sendString = "{\"folderName\":\"eSign Genie API Demo Documents\",\"templateIds\":[121195],\"fields\":{\"name\":\"%s\",\"start_date\":\"%s\",\"yes_services\":\"%s\",\"no_services\":\"%s\",\"comments\":\"%s\"},\"parties\":[{\"firstName\":\"%s\",\"lastName\":\"%s\",\"emailId\":\"%s\",\"permission\":\"FILL_FIELDS_AND_SIGN\",\"workflowSequence\":1,\"sequence\":1,\"allowNameChange\":false}],\"createEmbeddedSigningSession\":true,\"createEmbeddedSigningSessionForAllParties\":true,\"themeColor\":\"#80ff80\"}"
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
    } else sessionsAvailable[0].asJsonObject["embeddedSessionURL"].toString().replace("\"", "")

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