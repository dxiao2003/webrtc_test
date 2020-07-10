"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SipjsSessionDescriptionHandler = void 0;
var Web_1 = require("sip.js/lib/Web");
var api_1 = require("sip.js/lib/api");
var SessionDescriptionHandlerObserver_1 = require("sip.js/lib/Web/SessionDescriptionHandlerObserver");
var wrtc_1 = require("wrtc");
var SipjsSessionDescriptionHandler = /** @class */ (function (_super) {
    __extends(SipjsSessionDescriptionHandler, _super);
    function SipjsSessionDescriptionHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // copied from sip.js/lib/Web
    SipjsSessionDescriptionHandler.defaultFactory = function (session, options) {
        var logger = (session instanceof api_1.Session) ?
            session.userAgent.getLogger("sip.sessionDescriptionHandler", session.id) :
            session.ua.getLogger("sip.invitecontext.sessionDescriptionHandler", session.id);
        var observer = new SessionDescriptionHandlerObserver_1.SessionDescriptionHandlerObserver(session, options);
        return new SipjsSessionDescriptionHandler(logger, observer, options);
    };
    Object.defineProperty(SipjsSessionDescriptionHandler.prototype, "rtcAudioSource", {
        // TODO: add types for these
        get: function () {
            return this._rtcAudioSource;
        },
        enumerable: false,
        configurable: true
    });
    SipjsSessionDescriptionHandler.prototype.getMediaStream = function (constraints) {
        this._rtcAudioSource = new wrtc_1.nonstandard.RTCAudioSource();
        var track = this._rtcAudioSource.createTrack();
        var mediaStream = new wrtc_1.MediaStream([track]);
        return new Promise(function (resolve) {
            resolve(mediaStream);
        });
    };
    return SipjsSessionDescriptionHandler;
}(Web_1.SessionDescriptionHandler));
exports.SipjsSessionDescriptionHandler = SipjsSessionDescriptionHandler;
//# sourceMappingURL=sipjs.js.map