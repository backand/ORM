module.exports.chargeStripe = chargeStripe;
var testSecretKey = require('./config').testSecretKey;

var stripe = require("stripe")(
  testSecretKey
);

function chargeStripe(amount, currency, token, description, callback){
	// stripe.charges.create({
	//   amount: 400,
	//   currency: "usd",
	//   source: "tok_16TnbiBQsjd0vZS52XSR9O4Y", // obtained with Stripe.js
	//   description: "Charge for test@example.com"
	// }, function(err, charge) {
	//   // asynchronously called
	//   console.log(err);
	//   console.log(charge);
	// });	

	stripe.charges.create({
	  amount: amount,
	  currency: currency,
	  source: token,
	  description: description
	}, function(err, charge) {
	  // asynchronously called
	  console.log(err);
	  console.log(charge);
	  callback(err, charge);
	});	
}
