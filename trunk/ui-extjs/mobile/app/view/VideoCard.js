Ext.define('iWebRTC.view.VideoCard', {
    extend: 'Ext.Panel',
    xtype: 'videocard',

    config: {
        title: strings.video,
        iconCls: 'team',
        layout: 'fit',
        items: [
            { xtype: 'carousel', itemId: 'people-panel' }
        ]
    }
});