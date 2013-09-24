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
                defaults: { ui: 'plain' },
                items: [
                    { itemId: 'mnu-wb-prev', iconCls: 'arrow_left' },
                    { itemId: 'mnu-wb-new', iconCls: 'add' },
                    { xtype: 'spacer' },
                    { itemId: 'lbl-wb-current', xtype: 'label' },
                    { xtype: 'spacer' },
                    { itemId: 'mnu-wb-open', iconCls: 'action' },
                    { itemId: 'mnu-wb-next', iconCls: 'arrow_right' }
                ]
            },
            { xtype: 'panel', layout: 'fit', itemId: 'wb-tabs' }
        ],
        listeners: [
            { delegate: "#mnu-wb-prev", event: "tap", fn: "onTapPrev" },
            { delegate: "#mnu-wb-next", event: "tap", fn: "onTapNext" },
            { delegate: "#mnu-wb-new", event: "tap", fn: "onTapNew" },
            { delegate: "#mnu-wb-open", event: "tap", fn: "onTapOpen" },
            { delegate: "#wb-tabs", event: "activeitemchange", fn: "onActiveTab" },
            { delegate: "#wb-tabs", event: "remove", fn: "onRemoveTab" }
        ]
    },

    onTapPrev: function (btn) {
        var c = btn.up('wbcard').down('#wb-tabs');
        var oItem = c.getActiveItem();

        var i = 0;
        var count = c.items.length;
        for (; i < count; i++) {
            var item = c.getAt(i);
            if (item == oItem) {
                var n = (i + count - 1) % count;
                item = c.getAt(n);
                if (item) {
                    c.setActiveItem(item);
                }
                return;
            }
        }
    },

    onTapNext: function (btn) {
        var c = btn.up('wbcard').down('#wb-tabs');
        var oItem = c.getActiveItem();

        var i = 0;
        var count = c.items.length;
        for (; i < count; i++) {
            var item = c.getAt(i);
            if (item == oItem) {
                var n = (i + 1) % count;
                item = c.getAt(n);
                if (item) {
                    c.setActiveItem(item);
                }
                return;
            }
        }
    },

    onTapNew: function (btn) {
        wbs.add();
    },

    onTapOpen: function (btn) {
        //wbs.openM();
        alert('Not implement');
    },

    onActiveTab: function (c, item, oItem) {
        if (oItem) oItem.hide();
        if (item) {
            c.up('wbcard').down('#lbl-wb-current').setHtml(item.down('hiddenfield').getValue());
            item.show();
        } else {
            c.up('wbcard').down('#lbl-wb-current').setHtml('');
        }
    },

    onRemoveTab: function (c, item) {
        if (c.items.length == 0) {
            item.up('wbcard').down('#lbl-wb-current').setHtml('');
        }
    }
});