/* globals
  $http - service for AJAX calls - $http({method:"GET",url:CONSTS.apiUrl + "/1/objects/yourObject" , headers: {"Authorization":userProfile.token}});
  CONSTS - CONSTS.apiUrl for Backands API URL
*/
'use strict';
function backandCallback(userInput, dbRow, parameters, userProfile) {
	var mailgunAPIUrl = "https://api.mailgun.net/v3/sandboxde997a2fb44a45ee81e6ac2ba2f8065f.mailgun.org/messages";
	var sender = "kornatzky@gmail.com", 
	    receiver = "kornatzky@me.com", 
	    subject = "Hello", 
	    body = "World";
    var user = "api:key-7ige0080ltlgm8o20cg94fy5uczxpwj9";
    

    var encodedUser = btoa(user);
    console.log(encodedUser)
	var response = $http(
	    {
	        method:"POST",
	        url: mailgunAPIUrl, 
	        headers: {
	            "Authrization": "Basic " + encodedUser,
	            "Content-Type" : "multipart/form-data; charset=utf-8",
	        },
	        data: {
	            sender: "kornatzky@gmail.com", 
	            receiver: "kornatzky@me.com", 
	            subject: "Hello", 
	            text: "World"
	        }
	        
	    }
	);
    console.log(response);
	
	return {};
}