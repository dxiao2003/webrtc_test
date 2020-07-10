// some import
// AND/OR some export

declare module NodeJS  {
    interface Global {
        WebSocket: typeof WebSocket;
        RTCPeerConnection: typeof RTCPeerConnection;
    }
}