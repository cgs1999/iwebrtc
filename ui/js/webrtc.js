var ice_servs = { "iceServers": [{ "url": "stun:stun.l.google.com:19302"}] };
//var ice_servs = { "iceServers": [{ "url": "turn:42.96.140.164:3478"}] };
var constraints = { video: { mandatory: { maxWidth: 320, maxHeight: 240, maxFrameRate: 5} }, audio: true };
//https required
//var constraints = { video: { mandatory: { chromeMediaSource: 'screen'} } };

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL;
window.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
window.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;

var rtc = {};
rtc.localvideo = null;
rtc.localstream = null;
rtc.init = function (fn) {
    rtc.localvideo = ui.add_usr(myname).find('video')[0];
    navigator.getUserMedia(
        constraints,
        function (stream) {
            console.log(stream);
            rtc.localstream = stream;
            rtc.localvideo.src = URL.createObjectURL(stream);
            rtc.localvideo.play();

            if (fn) fn();
        },
        function (e) { console.log(e); }
    );
}
rtc.signal = function (data) {
    switch (data.signal) {
        case 'start':
            this.startS(data);
            break;
        case 'candidate':
            this.doCandidate(data);
            break;
        case 'offer':
            this.doOffer(data);
            break;
        case 'answer':
            this.doAnswer(data);
            break;
    }
}
rtc.startS = function(data){
    var user = get_user(data.from_id);
    if (user) {
        this.createRTCPeerConnection(user);
    }
}
rtc.startM = function (user) {
    socket.emit('message', { event: 'webrtc', signal: 'start', from_id: myid, to_id: user.id });
    this.createRTCPeerConnection(user);

    user.pc.createOffer(function (offer) {
        console.log('createOffer', offer);
        user.pc.setLocalDescription(offer, function () {
            socket.emit('message', { event: 'webrtc', signal: 'offer', from_id: myid, to_id: user.id, 'offer': offer });
        }, logError);
    });
}
rtc.createRTCPeerConnection = function (user) {
    user.pc = new RTCPeerConnection(ice_servs, { optional: [{ RtpDataChannels: true}] });
    user.pc.onicecandidate = function (evt) {
        if (evt.candidate) {
            console.log('pc.onicecandidate', evt.candidate);
            socket.emit('message', { event: 'webrtc', signal: 'candidate', from_id: myid, to_id: user.id, candidate: evt.candidate });
        }
    }
    user.pc.onaddstream = function (evt) {
        user.pv.src = URL.createObjectURL(evt.stream);
        user.pv.play();
    }
    user.pc.onremovestream = function () { console.log('pc.onremovestream', arguments); }
    user.pc.addStream(this.localstream);
}
rtc.doCandidate = function (data) {
    var user = get_user(data.from_id);
    if (user) {
        user.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}
rtc.doOffer = function (data) {
    var user = get_user(data.from_id);
    if (user) {
        user.pc.setRemoteDescription(new RTCSessionDescription(data.offer), function () {
            user.pc.createAnswer(function (answer) {
                console.log('createAnswer', answer);
                user.pc.setLocalDescription(answer, function () {
                    socket.emit('message', { event: 'webrtc', signal: 'answer', from_id: myid, to_id: user.id, 'answer': answer });
                }, logError);
            });
        }, logError);
    }
}
rtc.doAnswer = function (data) {
    var user = get_user(data.from_id);
    if (user) {
        user.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
}