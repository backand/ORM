var gcm = require('node-gcm');
var _ = require('underscore');


var sender = new gcm.Sender('AIzaSyCY8AOb3qF4dVODMkBELjR7n1ClfFnBwq4');

function sendMessage(deviceIds, messageLabel, msgObject, callback) {


    var message = new gcm.Message({
    //    collapseKey: 'getpro',
        delayWhileIdle: true,
    //    timeToLive: 3,
        dryRun: false
    });

    message.addData(
        _.extend(msgObject, 
            {
                message: messageLabel,
                msgcnt: 1
            }
        )
    );

    /**
     * Params: message-literal, registrationIds-array, No. of retries, callback-function
     **/
    sender.send(message, deviceIds, 4, function (err, result) {
        console.log(err);
        console.log(result);
        callback(err || result.success != 1 && result.failure == 0);
    });

}

// var deviceId = "APA91bG6VGJUxvZTmbGhOm7RUTMwwKbtyi0MC_utrZR3q4WukGtz2PzNyILXmTxTeN_vpPBmSQnvGBKLZtTr6zBSll0Qad0I7jtnwf1U1-hOQB--W7nDMvKuqjfAhSfettuKN1HI5d29";


// sendMessage(deviceId, "A new product was added", { "product": "Samsung TV", "productId": 100 }, function(err){
//     console.log(err);
//     process.exit(1);
// });
