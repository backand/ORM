// set apiKey to your Mailgun secret API key

var Mailgun = require('mailgun').Mailgun;

var apiKey = "key-7ige0080ltlgm8o20cg94fy5uczxpwj9";
var mg = new Mailgun(apiKey);

// sendEmail via Mailgun
// sender - sender email
// receiver - recipient email
// subject - of message
// body - of message
// callback - function with single parameter err, called with the error from Mailgun
function sendEmail(sender, receiver, subject, body, callback)
{
	
	mg.sendText(sender, receiver, subject, body,
         function(err) { 
         	callback(err);
         }
	);
}

// sendEmail("johndoe@example.com", "janesmith@acme.com", "Hello", "World", function(err){
// 	console.log(err);
// });