Ext.define('iWebRTC.view.Viewport', {
    extend: 'Ext.container.Viewport',

    layout: 'fit',

    items: [
        {
            xtype: 'panel',
            layout: 'border',
            tbar: {
                xtype: 'toolbar',
                defaults: { scale: 'medium' },
                items: [
                    { text: strings.option, iconCls: 'tb-opt', menu: {} },
                    { text: strings.audio, menu: {} },
                    { text: strings.video, menu: {} },
                    {
                        text: strings.wb, iconCls: 'tb-wb',
                        menu: {
                            items: [
                                { text: strings.wb_new, itemId: 'mnu-wb-new' },
                                { text: strings.wb_open, itemId: 'mnu-wb-open' }
                            ]
                        }
                    }
                ]
            },
            items: [
                {
                    xtype: 'panel',
                    region: 'center',
                    layout: 'border',
                    items: [
                        {
                            xtype: 'tabpanel',
                            itemId: 'wb-tabs',
                            region: 'center',
                            items: [
                                {
                                    title: strings.wb_0_title,
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                        pack: 'center'
                                    },
                                    items: [
                                        {
                                            xtype: 'container',
                                            html: strings.wb_0_body
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'grid',
                            region: 'south',
                            itemId: 'chat-grid',
                            title: strings.msg,
                            split: true,
                            collapsible: true,
                            hideHeaders: true,
                            height: 240,
                            minHeight: 200,
                            store: {
                                type: 'store',
                                fields: ['role', 'dt', 'name', 'msg']
                            },
                            bbar: [
                                { xtype: 'textfield', flex: 1, itemId: 'speaking', enableKeyEvents: true },
                                { xtype: 'button', text: strings.send_speak, itemId: 'snd-btn' }
                            ],
                            columns: [
                                {
                                    flex: 1, renderer: function (v, p, r) {
                                        return r.get('dt') + ', ' + r.get('name') + ', ' + r.get('msg');
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    region: 'east',
                    itemId: 'people-panel',
                    title: strings.people,
                    layout: {
                        type: 'vbox',
                        align: 'center'
                    },
                    split: true,
                    collapsible: true,
                    hideHeaders: true,
                    width: 350,
                    minWidth: 350
                }
            ]
        }
    ]
});