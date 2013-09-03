var myid = null;
var myname = null;
var joined_room = {};

getViewport = function () { return Ext.Viewport; }

PDFJS.workerSrc = '../pdfjs/pdf.js';

//alert(navigator.userAgent);
//alert(navigator.platform);

Ext.application({
    name: 'iWebRTC',

    launch: function () {
        Ext.Viewport.add(this.getMainView());
    },

    getMainView: function () {
        return {
            xtype: 'panel',
            fullscreen: true,
            layout: 'card',
            cardSwitchAnimation: {
                type: 'slide',
                cover: true
            },
            items: [{ xclass: 'iWebRTC.view.Login'}]
        };
    }
});