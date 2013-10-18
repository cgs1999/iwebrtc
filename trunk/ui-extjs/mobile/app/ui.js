function join_user(user) {
    chat.sys(strings.joinuser.format(user.name));

    user.pc = null;

    joined_users.add(user.id, user);

    return user;
}
function leave_user(id) {
    var user = joined_users.get(id);
    if (user) {
        chat.sys(strings.leaveuser.format(user.name));
        user.pc.close();
        var store = Ext.Viewport.down('videocard > dataview').getStore();
        var record = store.findRecord('url', user.src);
        store.remove(record);
    }
}

function getXPos(el) {
    var x = 0;
    while (el != null) {
        x += el.offsetLeft;
        el = el.offsetParent;
    }
    return x;
}

function getYPos(el) {
    var x = 0;
    while (el != null) {
        x += el.offsetTop;
        el = el.offsetParent;
    }
    return x;
}

function wb_create_ui(wb, title, closable) {
    var tab = Ext.create('Ext.Panel', {
        itemId: wb.id,
        layout: 'fit',
        hidden: true,
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
                        hidden: true,
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
                            {
                                iconCls: 'tb-cursor',
                                handler: function () {
                                    wb.drawMode = WB.DrawMode.None;
                                    tab.down('#wb-canvas').getScrollable().getScroller().setDisabled(false);
                                }
                            },
                            {
                                iconCls: 'tb-pen', pressed: true,
                                handler: function () {
                                    wb.drawMode = WB.DrawMode.Pen;
                                    tab.down('#wb-canvas').getScrollable().getScroller().setDisabled(true);
                                }
                            },
                            {
                                iconCls: 'tb-line',
                                handler: function () {
                                    wb.drawMode = WB.DrawMode.Line;
                                    tab.down('#wb-canvas').getScrollable().getScroller().setDisabled(true);
                                }
                            },
                            {
                                iconCls: 'tb-rect',
                                handler: function () {
                                    wb.drawMode = WB.DrawMode.Rect;
                                    tab.down('#wb-canvas').getScrollable().getScroller().setDisabled(true);
                                }
                            },
                            {
                                iconCls: 'tb-text',
                                handler: function () {
                                    wb.drawMode = WB.DrawMode.Text;
                                    tab.down('#wb-canvas').getScrollable().getScroller().setDisabled(true);
                                }
                            }
                        ]
                    },
                    { xtype: 'spacer' },
                    {
                        ui: 'decline', iconAlign: 'center', iconCls: 'delete', hidden: !closable,
                        handler: function () {
                            if (wb.creater == myid) {
                                wb.tab.up('#wb-tabs').remove(wb.tab);
                                wbs.del(wb.id);
                            }
                        }
                    }
                ]
            },
            {
                itemId: 'wb-canvas', xtype: 'panel', scrollable: 'both', //width: 1240, height: 1750,
                html: '<canvas width=' + 1240 + ' height=' + 1754 + '></canvas><canvas style="display:none"></canvas>'
            }
        ]
    });
    getViewport().down('#wb-tabs').add(tab);
    wb.init_mobile(tab);
    getViewport().down('#wb-tabs').setActiveItem(tab);

    tab.down('#wb-canvas').getScrollable().getScroller().setDisabled(true);
}

function wb_text_input(figure, e, wb) {
    Ext.Msg.prompt('', '', function (btn, text) {
        if (btn == 'ok') {
            figure.text = text;
            wb.finishText();
        }
    });
}