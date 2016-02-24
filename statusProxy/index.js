/**
 * Created by backand on 12/31/15.
 */
var request = require('request');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://ec2-52-3-33-37.compute-1.amazonaws.com:9200/'
});

// get the current status of the entire cluster.
// Note: params are always optional, you can just send a callback
client.cluster.health(function (err, resp) {
    if (err) {
        console.error(err.message);
    } else {
        console.dir(resp);
        var finish = false;
        console.log("index");
// index a document
        client.index({
            index: 'blog',
            type: 'post',
            id: 3,
            body: {
                title: 'JavaScript Everywhere!',
                content: 'It all started when...',
                date: new Date()
            }
        }, function (err, resp) {
            console.log(err, resp);
            finish = true;
        });
    }
});








/*
function checkServerStatus(address, name){
    request(address, function(error, response,body){
        if(error){
            sendError(address, name);
        }
        var jsonObject = JSON.parse(body);
        console.log(jsonObject);
    })
}




checkServerStatus("https://api.backand.com/api/system", "aaa");

    */