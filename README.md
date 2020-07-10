Use Node 14.5.0

Testing steps:

1. Edit ``build/index.js`` and enter valid SIP credentials:
   - ``uri``
   - ``authorizationUser``
   - ``password``
   - ``transportOptions.wsServers``
2. Install and run:
    ```$xslt
    $ npm install
    $ node build/index.js
    ```

##### Bug 1:

Try connecting to the SIP endpoint that was set in step 1.

**Expected behavior**: plays a snippet of audio from ``data/example.wav`` and records caller audio to a WAV file.
   
**Actual behavior**: some fraction of the time, the process crashes with a segmentation fault when answering the call.

##### Bug 2:

Try connecting tot he SIP endpoint that was set in step 1 but hang up right before it connects.

**Expected behavior**: server disconnects gracefully.

**Actual behavior**: some fraction of the time, the process crashes with a Javascript error ``"Error: Invalid argument"`` in the call ``this._pc.getSenders`` or ``this._pc.getReceivers`` in ``lib/peerconnection.js``
