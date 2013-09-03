function join_user(user) {
    chat.sys(strings.joinuser.format(user.name));

    user.pc = null;
    var panel = Ext.create('Ext.panel.Panel', {
        title: user.name,
        collapsible: true,
        frame: true,
        margin: 5,
        html: '<video width="320" height="240" autoplay="autoplay"></video>',
        listeners: {
            render: function (c) {
                user.pv = c.el.dom.getElementsByTagName('video')[0];
                user.ui = c;
            }
        }
    });
    getViewport().down('#people-panel').add(panel);
    joined_users.add(user.id, user);

    return user;
}
function leave_user(id) {
    var user = joined_users.get(id);
    if (user) {
        chat.sys(strings.leaveuser.format(user.name));
        user.pc.close();
        getViewport().down('#people-panel').remove(user.ui);
    }
}

function wb_create_ui(wb, title, closable) {
    var tab = Ext.create('Ext.panel.Panel', {
        'title': title,
        itemId: wb.id,
        'closable': closable,
        tbar: [
            {
                tooltip: strings.wb_cursor, iconCls: 'tb-cursor',
                handler: function () { wb.drawMode = WB.DrawMode.None; }
            },
			{
				tooltip: strings.wb_pen, iconCls: 'tb-pen',
				handler: function () { wb.drawMode = WB.DrawMode.Pen; }
			},
            {
                tooltip: strings.wb_line, iconCls: 'tb-line',
                handler: function () { wb.drawMode = WB.DrawMode.Line; }
            },
            {
                tooltip: strings.wb_rect, iconCls: 'tb-rect',
                handler: function () { wb.drawMode = WB.DrawMode.Rect; }
            },
            {
                tooltip: strings.wb_text, iconCls: 'tb-text',
                handler: function () { wb.drawMode = WB.DrawMode.Text; }
            },
            '-',
            {
                itemId: 'wb-tb-color',
                menu: {
                    xtype: 'colormenu',
                    value: wb.color.substr(1)
                }
            },
            '-',
            {
                xtype: 'combo',
                itemId: 'wb-tb-pages',
                width: 60,
                store: {
                    type: 'store',
                    fields: ['page_no'],
                    data: [{ page_no: 1}]
                },
                disabled: !closable,
                queryMode: 'local',
                displayField: 'page_no',
                value: 1,
                editable: false
            }
        ],
        autoScroll: true,
        layout: { type: 'vbox', align: 'center', pack: 'center' },
        items: [{
            xtype: 'panel',
            width: 1240,
            height: 1754,
            html: '<canvas width=' + 1240 + ' height=' + 1754 + '></canvas><canvas style="display:none"></canvas>'
        }]
    });
    getViewport().down('#wb-tabs').add(tab);
    tab.on('render', function () { wb.init(tab); });
    getViewport().down('#wb-tabs').setActiveTab(tab);
}