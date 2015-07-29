Installation
============
    npm install

Configuration
=============
From Stripe, `config.js`.
Payment form has hardwired `testPublishableKey`. 
In practice, should come from an inclusion of this part of `config.js`. Do not include the secret key.

Architecture
============
payment form
-------------

Fill the details and click submit.
Must submit legal credit card number. Use these: (https://www.paypalobjects.com/en_US/vhelp/paypalmanager_help/credit_card_numbers.htm)

**Flow:**

1. Calls Stripe.js with Ajax and receives a token. This calls uses just the credit card details. Receives a token.

2. Sends via Ajax the token with amount, currency, and description to our charging server.

charging server
---------------
1. Charges Stripe
2. In callback, returns error and charge object obtained from Stripe

static file server
------------------
Because we do not have a real server. Serves `payment_form.html`

Limitation
==========
The call to our charging server does not succeeed because of Access-Control-Allow-Origin error.

To actually do a test. Look at browser JavaScript console. Copy the token, and use the function `chargeStripe` in `stripe_charging.js`.

