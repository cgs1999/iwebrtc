function join_user(user) {
    chat.sys(strings.joinuser.format(user.name));

    user.pc = null;

    var container = Ext.Viewport.down('videocard > carousel');
    var panel = Ext.create('Ext.Panel', {
        items: [
            { xtype: "titlebar", docked: "top", title: user.name },
            { xtype: 'panel', html: '<video width="320" height="240" autoplay="autoplay"></video>' }
        ]
    });
    container.add(panel);

    user.pv = panel.element.dom.getElementsByTagName('video')[0];
    user.ui = panel;

    joined_users.add(user.id, user);

    return user;
}
function leave_user(id) {
    var user = joined_users.get(id);
    if (user) {
        chat.sys(strings.leaveuser.format(user.name));
        user.pc.close();
        Ext.Viewport.down('videocard > carousel').remove(user.ui);
    }
}

function wb_create_ui(wb, title, closable) {
    var tab = Ext.create('Ext.Panel', {
        itemId: wb.id,
        layout: 'fit',
        items: [
            { itemId: 'txt-title', xtype: 'hiddenfield', value: title },
            {
                xtype: "toolbar", docked: "top",
                width: '100%',
                items: [
                    {
                        xtype: 'selectfield',
                        width: 55,
                        itemId: 'wb-tb-pages',
                        displayField: 'page_no',
                        disabled: !closable,
                        store: {
                            data: [{ page_no: 1}]
                        },
                        value: 1
                    },
                    { xtype: 'spacer' },
                    {
                        xtype: 'segmentedbutton',
                        defaults: { iconAlign: 'center', style: 'padding: 0 2px' },
                        items: [
                            { iconCls: 'tb-cursor' },
                            { iconCls: 'tb-pen', pressed: true },
                            { iconCls: 'tb-line' },
                            { iconCls: 'tb-rect' },
                            { iconCls: 'tb-text' }
                        ]
                    },
                    { xtype: 'spacer' },
                    { ui: 'decline', iconAlign: 'center', iconCls: 'delete' }
                ]
            },
            {
                xtype: 'panel', width: 1240, height: 1750,
                html: '<canvas width=' + 1240 + ' height=' + 1754 + '></canvas><canvas style="display:none"></canvas>'
            }
        ]
    });
    //tab.title = title;
    getViewport().down('#wb-tabs').add(tab);
    wb.init_mobile(tab);
    getViewport().down('#wb-tabs').setActiveItem(tab);
}