module('Config', {
    setup: function () { },
    teardown: function () { }
});
test('vidr', function () {
    equal(vdir, '/webrtc/test/', 'vdir ok');
});
test('root_url', function () {
    equal(root_uri, 'http://127.0.0.1/', 'root_uri ok');
    equal(root_url(), 'http://127.0.0.1/', 'root_url() ok');
    equal(root_url('index.html'), 'http://127.0.0.1/index.html', 'root_url("index.html") ok');
});
test('site_uri', function () {
    equal(site_uri, 'http://127.0.0.1/webrtc/test/', 'site_uri ok');
    equal(site_url(), 'http://127.0.0.1/webrtc/test/', 'site_url() ok');
    equal(site_url('index.html'), 'http://127.0.0.1/webrtc/test/index.html', 'site_url("index.html") ok');
});
test('apply', function () {
    var a = null; b = {};
    a = apply(a, b);
    equal(typeof (a), 'object', 'object to null ok');
    b = { x: 1 };
    a = apply(a, b);
    equal(a.x, 1, 'object overlap ok');
    b = {};
    a = apply(a, b);
    equal(a.x, 1, 'object not overlap ok');
    b = null;
    a = apply(a, b);
    equal(a.x, 1, 'null to object ok');
});
test('applyIf', function () {
    var a = null; b = {};
    a = applyIf(a, b);
    equal(typeof (a), 'object', 'object to null ok');
    b = { x: 1 };
    a = applyIf(a, b);
    equal(a.x, 1, 'object overlap ok');
    b = { x: 2 };
    a = applyIf(a, b);
    equal(a.x, 1, 'object not overlap ok');
    b = null;
    a = applyIf(a, b);
    equal(a.x, 1, 'null to object ok');
});
test('request', function () {
    var s = '';
    for (var k in request) {
        s += '&' + k + '=' + request[k];
    }
    s = s.substr(1);
    if (s) s = '?' + s;
    equal(s, location.search, 'request ok');
});

module('WebRTC', {
    setup: function () { },
    teardown: function () { }
});
test('Interfaces', function () {
    notEqual(navigator.getUserMedia, null, 'getUserMedia ok');
    notEqual(URL, null, 'URL ok');
    notEqual(URL.createObjectURL, null, 'URL.createObjectURL ok');
    notEqual(RTCPeerConnection, null, 'RTCPeerConnection ok');
    notEqual(RTCIceCandidate, null, 'RTCIceCandidate ok');
    notEqual(RTCSessionDescription, null, 'RTCSessionDescription ok');
});
