Ext.define('iWebRTC.view.Main', {
    extend: "Ext.tab.Panel",
    xtype: 'main',

    config: {
        tabBarPosition: 'bottom',
        items: [
            { xtype: 'panel', title: strings.home, iconCls: 'home' },
            { xtype: 'panel', title: strings.video, iconCls: 'team', html: 'a' },
            { xtype: 'panel', title: strings.wb, iconCls: 'action', html: 'b' },
            { xtype: 'panel', title: strings.msg, iconCls: 'info', html: 'c' }
        ]
    }
});