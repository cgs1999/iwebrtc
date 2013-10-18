Ext.define('iWebRTC.view.VideoCard', {
    extend: 'Ext.Panel',
    xtype: 'videocard',

    config: {
        title: strings.video,
        iconCls: 'team',
        layout: 'fit',
        items: [
            {
                xtype: 'dataview',
                itemId: 'people-panel',
                scrollable: true,
                inline: true,
                itemTpl: '<center><video width="320" height="240" autoplay="autoplay" src="{url}"></video><div>{name}</div><center>',
                store: {
                    fields: ['url', 'name']
                }
            }
        ]
    }
});