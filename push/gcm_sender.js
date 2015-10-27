var gcm = require('node-gcm');



var sender = new gcm.Sender('AIzaSyDmYs5TmhVT_l4omMBZdWm_2n5uFQ4gpFw');
  



function   sendMessage(deviceId, type, value, callback) {


    var message = new gcm.Message({
    //    collapseKey: 'getpro',
        delayWhileIdle: true,
    //    timeToLive: 3,
        dryRun: false
    });

    var registrationIds = [];
    var messageLabel = "";
    switch(type)
    {

        case "order": 
            messageLabel = "התקבלה הזמנה חדשה";
        break;

        case "response":
            messageLabel = "התקבלה תגובה להזמנה";
        break;

        default:
        break;
    }


    message.addDataWithObject({
        key1: type,
        key2: value,
        message: messageLabel,
        msgcnt: 1
    });


    // At least one required
    registrationIds.push(deviceId);


    /**
     * Params: message-literal, registrationIds-array, No. of retries, callback-function
     **/
    sender.send(message, registrationIds, 4, function (err, result) {
        console.log(err);
        console.log(result);
        callback(err || result.success != 1 && result.failure == 0);
    });

}

var deviceId = "APA91bG6VGJUxvZTmbGhOm7RUTMwwKbtyi0MC_utrZR3q4WukGtz2PzNyILXmTxTeN_vpPBmSQnvGBKLZtTr6zBSll0Qad0I7jtnwf1U1-hOQB--W7nDMvKuqjfAhSfettuKN1HI5d29";


sendMessage(deviceId, "product", 5, function(err){
    console.log(err);
    process.exit(1);
});
