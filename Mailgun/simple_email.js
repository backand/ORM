var Mailgun = require('mailgun').Mailgun;

var apiKey = "key-7ige0080ltlgm8o20cg94fy5uczxpwj9";
var mg = new Mailgun(apiKey);

function sendEmail(sender, receiver, subject, body, callback)
{
	
	mg.sendText(sender, receiver, subject, body,
         function(err) { 
         	callback(err);
         }
	);
}

// sendEmail("kornatzky@backand.com", "kornatzky@gmail.com", "Hello", "World", function(err){
// 	console.log(err);
// });