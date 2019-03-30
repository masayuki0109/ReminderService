const Alexa = require('ask-sdk')

class ReminderService {
    
    constructor(handlerInput){
        this.apiClient = new Alexa.DefaultApiClient();
        this.reminderApiPath = '/v1/alerts/reminders';
        this.token = handlerInput.requestEnvelope.context.System.apiAccessToken;
        this.apiEndpoint = handlerInput.requestEnvelope.context.System.apiEndpoint;
        this.requestId = handlerInput.requestEnvelope.request.requestId;
    }
    
    async create(message, offsetInSeconds)  {
 
        const body = {
            requestTime : (new Date()).toISOString(),
            trigger: {
                type : "SCHEDULED_RELATIVE",
                offsetInSeconds : offsetInSeconds,
            },
            alertInfo: {
                spokenInfo: {
                    content: [{
                        locale: "ja-JP",
                        text: message
                    }]
                }
            },
            pushNotification : {                            
                status : "ENABLED"                         
            }
        }
 
        const request  = {
            body : JSON.stringify(body),
            headers : [ {key : 'Authorization', value : `Bearer ${this.token}`} ,
            {key: 'Content-Type', value : 'application/json'}],
            method : 'POST',
            url : this.apiEndpoint + this.reminderApiPath,
        };

        const response =  await this.apiClient.invoke(request);
        // if(response.statusCode == 201){
        if(response.statusCode >= 200 && response.statusCode <= 210){

            return true;
        }
        const responsBody = JSON.parse(response.body)
        return false;
    }

    async directivesApi(message){
        const body = {
          "header":{ 
            "requestId": this.requestId
          },
          "directive":{ 
            "type":"VoicePlayer.Speak",
            "speech":`${message}`
          }
        }
        const request ={
            headers : [ {key : 'Authorization', value : `Bearer ${this.token}`} ,
            {key: 'Content-Type', value : 'application/json'}],
            body : JSON.stringify(body),
            method : "POST",
            url : this.apiEndpoint + '/v1/directives'
        };
        
        const response =  await this.apiClient.invoke(request);
        if(response.statusCode >= 200 && response.statusCode <= 210){
            return true;
        }
        return false;
    }

    askPermission(message){
        const PERMISSIONS = ['alexa::alerts:reminders:skill:readwrite'];
        return this.handlerInput.responseBuilder
            .speak(message)
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
    }
    
}

module.exports = ReminderService;