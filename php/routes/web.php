<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

function validateCaptcha($token) {
    $response = Http::asForm() -> withHeaders([
        "Origin" => env("CORS_ORIGIN")
    ]) -> post(env("CAPTCHA_ENDPOINT"), [
        "secret" => env("CAPTCHA_SECRET"),
        "response" => $token
    ]);

    return json_decode($response->body())->{"success"};
}

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

    $sendString = "{\"folderName\":\"eSign Genie API Demo Documents\",\"templateIds\":[121195],\"fields\":{\"name\":\"$fullName\",\"start_date\":\"$startDate\",\"yes_services\":\"$yesServices\",\"no_services\":\"$noServices\",\"comments\":\"$comments\"},\"parties\":[{\"firstName\":\"$firstName\",\"lastName\":\"$lastName\",\"emailId\":\"$email\",\"permission\":\"FILL_FIELDS_AND_SIGN\",\"workflowSequence\":1,\"sequence\":1,\"allowNameChange\":false}],\"createEmbeddedSigningSession\":true,\"createEmbeddedSigningSessionForAllParties\":true,\"themeColor\":\"#80ff80\"}";

    $createResponse = Http::withHeaders([
        "Origin" => env('CORS_ORIGIN'),
        "Authorization" => $token
    ]) -> post(env("FOLDER_ENDPOINT"), \GuzzleHttp\json_decode($sendString, true));

    return json_decode($createResponse->body())->{"embeddedSigningSessions"}[0]->{"embeddedSessionURL"};
}

Route::post('/demoform', function(Request $request, \Illuminate\Http\Response $response) {
    if(!validateCaptcha($request->header("Authorization")))
    {
        return response("Unauthorized", 401);
    }

    return retrieveSigningSession(retrieveAccessToken(), $request, $response);
});
