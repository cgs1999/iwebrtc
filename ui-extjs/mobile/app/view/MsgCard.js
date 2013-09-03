Ext.define('iWebRTC.view.MsgCard', {
    extend: 'Ext.Panel',
    xtype: 'msgcard',

    config: {
        title: strings.msg,
        iconCls: 'more',
        layout: 'fit',
        items: [
            {
                xtype: 'list',
                itemId: 'chat-grid',
                itemTpl: '{dt},{name},{msg}',
                infinite: true,
                useSimpleItems: true,
                scrollable: true,
                store: {
                    type: 'store',
                    fields: ['role', 'dt', 'name', 'msg']
                }
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    { xtype: 'textfield', flex: 1, itemId: 'speaking', enableKeyEvents: true },
                    { xtype: 'button', text: strings.send_speak, itemId: 'snd-btn' }
                ]
            }
        ],
        listeners: [
            { delegate: "#snd-btn", event: "tap", fn: "onTapSend" }
        ]
    },

    onTapSend: function (btn) {
        var c = btn.up('msgcard').down('#speaking');
        chat.emit(c.getValue());
        c.setValue('');
    }
});