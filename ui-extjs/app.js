var myid = null;
var myname = decodeURI(request['name']) || strings.anonymous;
var joined_room = {};
joined_room.no = request['no'];

var getViewport = null;

PDFJS.workerSrc = 'pdfjs/pdf.js';

Ext.application({
    name: 'iWebRTC',

    autoCreateViewport: true,

    controllers: ['Main'],

    init: function () {
    }
});

