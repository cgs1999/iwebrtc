Ext.define('iWebRTC.controller.Main', {
    extend: 'Ext.app.Controller',

    init: function () {
        this.control({
            'viewport': {
                render: function (c) {
                    getViewport = function () { return c; }
                    rtc.init(function () { main.connect(); });
                }
            },
            'viewport #speaking': {
                keydown: function (c, e) {
                    if (e.getKey() == Ext.EventObject.ENTER) {
                        chat.emit(c.getValue());
                        c.setValue('');
                    }
                }
            },
            'viewport #snd-btn': {
                click: function (btn) {
                    var c = btn.up('viewport').down('#speaking');
                    chat.emit(c.getValue());
                    c.setValue('');
                }
            },
            'viewport #mnu-wb-new': {
                click: function () {
                    wbs.add();
                }
            },
            'viewport #mnu-wb-open': {
                click: function () {
                    wbs.openM();
                }
            },
            'viewport tabpanel colormenu': {
                select: function (cp, color) {
                    var cr = '#' + color;
                    cp.up('panel').up('panel').down('#wb-tb-color').el.dom.getElementsByTagName('span')[0].style.backgroundColor = cr;
                    cp.up('panel').up('panel').wb.color = cr;
                }
            }
        });
    }
});