//var ws_serv = 'ws://' + location.host;
var ws_serv = 'ws://127.0.0.1:1339';
var myid = null;
var myname = request['name'] || strings.anonymous;
var socket = null;
var joined_room = {};
joined_room.no = request['no'];
var joined_users = new Ext.util.HashMap();

var getViewport = null;

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

Ext.application({
    name: 'iWebRTC',

    autoCreateViewport: true,

    controllers: ['Main'],

    init: function () {
    }
});

