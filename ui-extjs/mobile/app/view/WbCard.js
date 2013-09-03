Ext.define('iWebRTC.view.WbCard', {
    extend: 'Ext.Panel',
    xtype: 'wbcard',

    config: {
        title: strings.wb,
        iconCls: 'action',
        layout: 'fit',
        items: [
            {
                xtype: "toolbar", docked: "top",
                items: [
                    { itemId: 'mnu-wb-new', ui: 'plain', iconCls: 'add' },
                    { xtype: 'spacer' },
                    { itemId: 'lbl-wb-current', xtype: 'label' },
                    { xtype: 'spacer' },
                    { itemId: 'mnu-wb-open', ui: 'plain', iconCls: 'action' }
                ]
            },
            { xtype: 'carousel', itemId: 'wb-tabs' }
        ],
        listeners: [
            { delegate: "#mnu-wb-new", event: "tap", fn: "onTapNew" },
            { delegate: "#mnu-wb-open", event: "tap", fn: "onTapOpen" },
            { delegate: "#wb-tabs", event: "activeitemchange", fn: "onActiveTab" },
            { delegate: "#wb-tabs", event: "remove", fn: "onRemoveTab" }
        ]
    },

    onTapNew: function (btn) {
        wbs.add();
    },

    onTapOpen: function (btn) {
        wbs.openM();
    },

    onActiveTab: function (c, item) {
        if (item) {
            c.up('wbcard').down('#lbl-wb-current').setHtml(item.down('hiddenfield').getValue());
        } else {
            c.up('wbcard').down('#lbl-wb-current').setHtml('');
        }
    },

    onRemoveTab: function (c) {
        if (c.items.length == 0) {
            item.up('wbcard').down('#lbl-wb-current').setHtml('');
        }
    }
});