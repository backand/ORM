module.exports.sendMessage = sendMessage;

var gcm = require('node-gcm');
var _ = require('underscore');


/** @function
 * @name sendMessage
 * @description send a push notification through GCM push service to a 
 * set of Android devices
 * push notification appears as text on device and can include data to be processed by app
 * we do not deal with badges on the app icon or with custom sound or icon for notification
 * @param {string} ServerAPIKey - from Google Play for app
 * @param {array} deviceIds - array of strings - Android device ids
 * @param {string} messageLabel - label of push notification
 * @param {object} msgObject - data to send with push
 * @param {function} callback - function(err)
 */

function sendMessage(ServerAPIKey, deviceIds, messageLabel, msgObject, callback) {

    var sender = new gcm.Sender(ServerAPIKey); // 'AIzaSyCY8AOb3qF4dVODMkBELjR7n1ClfFnBwq4'

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
        callback(err || result.success != 1 && result.failure == 0);
    });

}

// var deviceId = "APA91bG6VGJUxvZTmbGhOm7RUTMwwKbtyi0MC_utrZR3q4WukGtz2PzNyILXmTxTeN_vpPBmSQnvGBKLZtTr6zBSll0Qad0I7jtnwf1U1-hOQB--W7nDMvKuqjfAhSfettuKN1HI5d29";


// sendMessage(deviceId, "A new product was added", { "product": "Samsung TV", "productId": 100 }, function(err){
//     console.log(err);
//     process.exit(1);
// });
