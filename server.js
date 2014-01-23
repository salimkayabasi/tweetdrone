var arDrone = require('ar-drone');
var http = require('http');

var Twit = require('twit');

var T = new Twit({
    consumer_key: 'axt7Z7Zi83M9TuTWd9GC8g',
    consumer_secret: 'bkq6ss1XV8fKOBjE1Aza2Ve9xVJjIHnTefcRNBcU7w',
    access_token: '35338996-u5APylPfGnJNzNaBNvbRBQagR2ZR83dLtpMLK1K2r',
    access_token_secret: 'QQoeUO8JYDc47M4bkGkTbakWCLUZuWIcWygny549rFyX8'
});


var client = arDrone.createClient();
client.disableEmergency();

console.log('Connecting png stream ...');
var pngStream = client.getPngStream();

console.log('Connecting twitter stream ...');
var stream = T.stream('user');

var lastPng;
pngStream
    .on('error', console.log)
    .on('data', function (pngBuffer) {
        lastPng = pngBuffer;
    });

var server = http.createServer(function (req, res) {
    if (!lastPng) {
        res.writeHead(503);
        res.end('Did not receive any png data yet.');
        return;
    }
    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(lastPng);
});

function do_action(str) {
    switch (true) {
        case /^to/.test(str):
            console.log("• doing takeoff");
            client.takeoff();
            break;
        case /^la/.test(str):
            console.log("• doing land");
            client.land();
            break;
        case /^st/.test(str):
            console.log("• doing stop");
            client.stop();
            break;
        case /^cw/.test(str):
            console.log("• rotate clockwise");
            client.clockwise(0.5);
            break;
        case /^cc/.test(str):
            console.log("• rotate counterclockwise");
            client.clockwise(-0.5);
            break;
        default:
            console.log("• unknown command:" + str + ":");
            break;
    }
}

console.log('streaming from twitter...');
stream.on('tweet', function (tweet) {

    var msg = tweet.text.split(" ").slice(1).join(" ");
    console.log("got msg from twitter:" + msg + ":");
    do_action(msg);

});

server.listen(8080, function () {
    console.log('Serving latest png on port 8080 ...');
});