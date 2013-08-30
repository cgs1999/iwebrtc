Ext.define('iWebRTC.view.Login', {
    extend: "Ext.form.Panel",
    xtype: 'login',

    config: {
        items: [
            {
                xtype: "titlebar",
                docked: "top",
                title: strings.sign_title
            },
            {
                xtype: 'fieldset',
                defaults: { required: true },
                items: [
                    {
                        xtype: 'selectfield',
                        name: 'no',
                        placeHolder: strings.sign_no_empty,
                        valueField: 'no',
                        displayField: 'name',
                        store: {
                            data: [
                                { no: 0, name: 'Test Room 1' },
                                { no: 1, name: 'Test Room 2' },
                                { no: 2, name: 'Test Room 3' },
                                { no: 3, name: 'Test Room 4' }
                            ]
                        }
                    },
                    {
                        xtype: 'textfield',
                        name: 'name',
                        placeHolder: strings.sign_name_empty
                    }
                ]
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    { xtype: 'spacer' },
                    { itemId: 'btn-ok', text: strings.confirm },
                    { itemId: 'btn-cancel', text: strings.reset }
                ]
            }
        ],
        listeners: [
            { delegate: '#btn-ok', event: 'tap', fn: 'OnOK' },
            { delegate: '#btn-cancel', event: 'tap', fn: 'OnCancel' },
        ]
    },

    OnOK: function (btn) {
        var o = btn.up('formpanel').getValues();
        Ext.Viewport.animateActiveItem({ xclass: 'iWebRTC.view.Main' }, { type: 'slide', direction: 'left' });
    },

    OnCancel: function (btn) {
        btn.up('formpanel').reset();
    }
});