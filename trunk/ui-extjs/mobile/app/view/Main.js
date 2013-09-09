Ext.define('iWebRTC.view.Main', {
    extend: "Ext.tab.Panel",
    xtype: 'main',

    config: {
        tabBarPosition: 'bottom',
        items: [
            { xclass: 'iWebRTC.view.HomeCard' },
            { xclass: 'iWebRTC.view.VideoCard' },
            { xclass: 'iWebRTC.view.WbCard' },
            { xclass: 'iWebRTC.view.MsgCard' }
        ],
        listeners: {
            'painted': function (c) {
                Ext.Viewport.setMasked({ xtype: 'loadmask' });
                rtc.init_mobile(function () { main.connect(); });
            }
        }
    }
});