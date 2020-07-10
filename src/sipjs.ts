import {SessionDescriptionHandler} from "sip.js/lib/Web";
import {InviteClientContext, InviteServerContext} from "sip.js";
import {Session} from "sip.js/lib/api";
import {Logger} from "sip.js/lib/core";
import {SessionDescriptionHandlerObserver} from "sip.js/lib/Web/SessionDescriptionHandlerObserver";
import {MediaStream, nonstandard} from 'wrtc';
type RTCAudioSource = nonstandard.RTCAudioSource;

export class SipjsSessionDescriptionHandler extends SessionDescriptionHandler {
    // copied from sip.js/lib/Web
    public static defaultFactory(
        session: InviteClientContext | InviteServerContext | Session,
        options: any
    ): SessionDescriptionHandler {
        const logger: Logger =
            (session instanceof Session) ?
                session.userAgent.getLogger("sip.sessionDescriptionHandler", session.id) :
                session.ua.getLogger("sip.invitecontext.sessionDescriptionHandler", session.id);
        const observer: SessionDescriptionHandlerObserver = new SessionDescriptionHandlerObserver(session, options);
        return new SipjsSessionDescriptionHandler(logger, observer, options);
    }

    // TODO: add types for these
    public get rtcAudioSource(): RTCAudioSource {
        return this._rtcAudioSource;
    }
    private _rtcAudioSource: RTCAudioSource;

    protected getMediaStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
        this._rtcAudioSource = new nonstandard.RTCAudioSource();
        const track = this._rtcAudioSource.createTrack() as MediaStreamTrack;
        const mediaStream = new MediaStream([track]);
        return new Promise((resolve) => {
            resolve(mediaStream);
        });
    }
}
