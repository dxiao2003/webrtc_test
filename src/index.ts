import {UA} from "sip.js";

import {nonstandard} from 'wrtc';

const {RTCAudioSink} = require('wrtc').nonstandard;
type RTCAudioSource = nonstandard.RTCAudioSource;

import { FileWriter } from 'wav';
import { Readable } from 'stream';
import {SessionDescriptionHandler} from "sip.js/lib/Web";
import {SipjsSessionDescriptionHandler} from "./sipjs";

const WebSocket = require('ws');
const { RTCPeerConnection } = require('wrtc');

// use this to replace the WebSocket and RTCPeerConnection used by SIP.js
global.WebSocket = WebSocket;
global.RTCPeerConnection = RTCPeerConnection;

let ua = new UA({
    uri: "test-uri@domain.com",
    authorizationUser: "test-user",
    password: "test-password",
    transportOptions: {
        wsServers: "wss://test-ws-servers.com"
    },
    sessionDescriptionHandlerFactory: SipjsSessionDescriptionHandler.defaultFactory,
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

ua.on("invite", (session) => {
    session.on('trackAdded', () => {
        let pc = (session.sessionDescriptionHandler as SessionDescriptionHandler).peerConnection;
        let filename = session.remoteIdentity.displayName + ".wav";
        // console.log(`Remote URI: ${session.remoteIdentity.uri}`);
        // console.log(`Local URI: ${session.localIdentity.uri}`);
        // console.log(`Request ${JSON.stringify(session.request)}`);
        // console.log(`Data ${JSON.stringify(session.data)}`);
        // console.log(`Remote identity ${JSON.stringify(session.remoteIdentity)}`);
        let outputFileStream = new FileWriter(filename, {
            sampleRate: "44100",
            channels: 1,
        });
        let streamBuffer = new Readable({
            read(size: number): void {
            }
        });
        streamBuffer.pipe(outputFileStream);
        pc.getReceivers().forEach((receiver) => {
            if (receiver.track.kind == "audio") {
                let sink = new RTCAudioSink(receiver.track);
                sink.ondata = (data) => {
                    let numberOfFrames = data.numberOfFrames;
                    streamBuffer.push(Buffer.from(data.samples.buffer));
                };
            }
        });
    });

    session.on("SessionDescriptionHandler-created", (handler) => {
        console.log("Session description created");
        const sessionDescriptionHandler = handler as SipjsSessionDescriptionHandler;
        const pc = sessionDescriptionHandler.peerConnection;
        sessionDescriptionHandler.on("iceConnectionConnected", () => {
            playFileToCall("data/example.wav", sessionDescriptionHandler.rtcAudioSource);
        });
    });

    console.log("invited");
    session.accept();
});

process.on("exit", (code) => {
    console.log("Disconnecting");
    ua.stop();
});

import * as fs from "fs";
import {Reader} from "wav";

function playFileToCall(filename: string, audioSource: RTCAudioSource) {
    let file = fs.createReadStream(filename);
    let reader = new Reader();
    reader.on("format", function(format) {
        reader.pause();
        const sampleRate = format.sampleRate;
        const channels = format.channels;
        const bitsPerSample = format.bitDepth;
        const numberOfFrames = Math.floor(sampleRate / 100);
        const readSize = Math.floor(numberOfFrames * bitsPerSample / 8);
        const readTimer = setInterval(
            () => {
                const chunk = reader.read(readSize);
                if (chunk && chunk.byteLength == readSize) {
                    const bufferSlice = chunk.buffer.slice(
                        chunk.byteOffset,
                        chunk.byteOffset + chunk.byteLength
                    );
                    audioSource.onData({
                        samples: new Int16Array(bufferSlice),
                        sampleRate: sampleRate,
                        bitsPerSample: bitsPerSample,
                        channelCount: channels,
                        numberOfFrames: numberOfFrames
                    });
                }
            },
            10
        );
        reader.on("end", () => {
            clearInterval(readTimer);
        });
    });
    file.pipe(reader);
}
