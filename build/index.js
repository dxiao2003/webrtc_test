"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sip_js_1 = require("sip.js");
var RTCAudioSink = require('wrtc').nonstandard.RTCAudioSink;
var wav_1 = require("wav");
var stream_1 = require("stream");
var sipjs_1 = require("./sipjs");
var WebSocket = require('ws');
var RTCPeerConnection = require('wrtc').RTCPeerConnection;
// use this to replace the WebSocket and RTCPeerConnection used by SIP.js
global.WebSocket = WebSocket;
global.RTCPeerConnection = RTCPeerConnection;
var ua = new sip_js_1.UA({
    uri: "test-uri@domain.com",
    authorizationUser: "test-user",
    password: "test-password",
    transportOptions: {
        wsServers: "wss://test-ws-servers.com"
    },
    sessionDescriptionHandlerFactory: sipjs_1.SipjsSessionDescriptionHandler.defaultFactory,
    sessionDescriptionHandlerFactoryOptions: {
        constraints: {
            audio: true,
            video: false
        },
        peerConnectionOptions: {
            iceCheckingTimeout: 200
        }
    }
});
ua.on("invite", function (session) {
    session.on('trackAdded', function () {
        var pc = session.sessionDescriptionHandler.peerConnection;
        var filename = session.remoteIdentity.displayName + ".wav";
        // console.log(`Remote URI: ${session.remoteIdentity.uri}`);
        // console.log(`Local URI: ${session.localIdentity.uri}`);
        // console.log(`Request ${JSON.stringify(session.request)}`);
        // console.log(`Data ${JSON.stringify(session.data)}`);
        // console.log(`Remote identity ${JSON.stringify(session.remoteIdentity)}`);
        var outputFileStream = new wav_1.FileWriter(filename, {
            sampleRate: "44100",
            channels: 1,
        });
        var streamBuffer = new stream_1.Readable({
            read: function (size) {
            }
        });
        streamBuffer.pipe(outputFileStream);
        pc.getReceivers().forEach(function (receiver) {
            if (receiver.track.kind == "audio") {
                var sink = new RTCAudioSink(receiver.track);
                sink.ondata = function (data) {
                    var numberOfFrames = data.numberOfFrames;
                    streamBuffer.push(Buffer.from(data.samples.buffer));
                };
            }
        });
    });
    session.on("SessionDescriptionHandler-created", function (handler) {
        console.log("Session description created");
        var sessionDescriptionHandler = handler;
        var pc = sessionDescriptionHandler.peerConnection;
        sessionDescriptionHandler.on("iceConnectionConnected", function () {
            playFileToCall("data/example.wav", sessionDescriptionHandler.rtcAudioSource);
        });
    });
    console.log("invited");
    session.accept();
});
process.on("exit", function (code) {
    console.log("Disconnecting");
    ua.stop();
});
var fs = require("fs");
var wav_2 = require("wav");
function playFileToCall(filename, audioSource) {
    var file = fs.createReadStream(filename);
    var reader = new wav_2.Reader();
    reader.on("format", function (format) {
        reader.pause();
        var sampleRate = format.sampleRate;
        var channels = format.channels;
        var bitsPerSample = format.bitDepth;
        var numberOfFrames = Math.floor(sampleRate / 100);
        var readSize = Math.floor(numberOfFrames * bitsPerSample / 8);
        var readTimer = setInterval(function () {
            var chunk = reader.read(readSize);
            if (chunk && chunk.byteLength == readSize) {
                var bufferSlice = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
                audioSource.onData({
                    samples: new Int16Array(bufferSlice),
                    sampleRate: sampleRate,
                    bitsPerSample: bitsPerSample,
                    channelCount: channels,
                    numberOfFrames: numberOfFrames
                });
            }
        }, 10);
        reader.on("end", function () {
            clearInterval(readTimer);
        });
    });
    file.pipe(reader);
}
//# sourceMappingURL=index.js.map