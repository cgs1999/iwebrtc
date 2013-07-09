var ROLE = {
    SYSTEM: 1,
    SELF: 2,
    USER: 3
};

function join_user(user) {
    chat.sys(strings.joinuser.format(user.name));

    user.pc = null;
    var panel = Ext.create('Ext.panel.Panel', {
        title: user.name,
        collapsible: true,
        frame: true,
        margin: 5,
        html: '<video width="320" height="240"></video>',
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

Ext.define('main', {
    singleton: true,

    connect: function () {
        socket = io.connect(ws_serv);
        socket.on('connect', function () { chat.sys(strings.connecting); });
        socket.on('disconnect', function () { chat.sys(strings.disconnect); });
        socket.on('session', function (data) { myid = data.id; });
        socket.on('info_ok', function (data) {
            joined_room = Ext.apply(joined_room, data);
            socket.emit('join', { no: joined_room.no, name: myname });
            chat.sys(strings.enterroom.format(joined_room.name));
        });
        socket.on('join_user', function (data) { join_user(data); });
        socket.on('join_ok', function (data) {
            for (var i = 0; i < data.length; i++) {
                rtc.startM(join_user(data[i]));
            }
        });
        socket.on('leave_user', function (data) { leave_user(data.id); });
        socket.on('leave_ok', function (data) { console.log(data); });
        socket.on('message', function (data) {
            switch (data.event) {
                case 'webrtc':
                    rtc.signal(data);
                    break;
                case 'chat':
                    chat.signal(data);
                    break;
                case 'wbs':
                    wbs.signal(data);
                default:
                    console.log(data);
                    break;
            }
        });
        socket.on('error', function (data) { chat.sys(strings.connfailed); console.log(data); });
        socket.emit('info', { no: joined_room.no });
    }
});

Ext.define('chat', {
    singleton: true,

    emit: function (msg) {
        var dt = Ext.Date.format(new Date(), 'H:i:s');
        socket.emit('message', { event: 'chat', from: myname, time: dt, text: msg });
        chat.self(dt, msg);
    },

    signal: function (data) {
        chat.user(data.time, data.from, data.text);
    },

    sys: function (msg) {
        var dt = Ext.Date.format(new Date(), 'H:i:s');
        this.message(ROLE.SYSTEM, dt, strings.system, msg);
    },
    self: function (dt, msg) {
        this.message(ROLE.SELF, dt, myname, msg);
    },
    user: function (dt, name, msg) {
        this.message(ROLE.USER, dt, name, msg);
    },
    message: function (role, dt, name, msg) {
        var d = {};
        d['role'] = role;
        d['dt'] = dt;
        d['name'] = name;
        d['msg'] = msg;
        var grid = getViewport().down('#chat-grid');
        grid.getStore().loadData([d], true);
        if (grid.scroll) {
            grid.scrollByDeltaY(grid.getScrollTarget().el.dom.scrollHeight);
        }
    }
});

Ext.define('rtc', {
    singleton: true,
    localvideo: true,
    localstream: true,

    init: function (fn) {
        var me = this;
        var panel = Ext.create('Ext.panel.Panel', {
            title: myname,
            collapsible: true,
            frame: true,
            margin: 5,
            html: '<video width="320" height="240"></video>',
            listeners: {
                render: function (c) {
                    me.localvideo = c.el.dom.getElementsByTagName('video')[0];
                    navigator.getUserMedia(
                        constraints,
                        function (stream) {
                            console.log(stream);
                            me.localstream = stream;
                            me.localvideo.src = URL.createObjectURL(stream);
                            me.localvideo.play();
                            if (fn) fn();
                        },
                        function (e) {
                            chat.sys(strings.media_err);
                            console.log(e);
                        }
                    );
                }
            }
        });
        getViewport().down('#people-panel').add(panel);
    },

    signal: function (data) {
        switch (data.signal) {
            case 'start':
                this.startS(data);
                break;
            case 'candidate':
                this.doCandidate(data);
                break;
            case 'offer':
                this.doOffer(data);
                break;
            case 'answer':
                this.doAnswer(data);
                break;
        }
    },

    startS: function (data) {
        var user = joined_users.get(data.from_id);
        if (user) this.createRTCPeerConnection(user);
    },

    startM: function (user) {
        socket.emit('message', { event: 'webrtc', signal: 'start', from_id: myid, to_id: user.id });
        this.createRTCPeerConnection(user);

        user.pc.createOffer(function (offer) {
            console.log('createOffer', offer);
            user.pc.setLocalDescription(offer, function () {
                socket.emit('message', { event: 'webrtc', signal: 'offer', from_id: myid, to_id: user.id, 'offer': offer });
            }, logError);
        });
    },

    createRTCPeerConnection: function (user) {
        user.pc = new RTCPeerConnection(ice_servs, { optional: [{ RtpDataChannels: true}] });
        user.pc.onicecandidate = function (evt) {
            if (evt.candidate) {
                console.log('pc.onicecandidate', evt.candidate);
                socket.emit('message', { event: 'webrtc', signal: 'candidate', from_id: myid, to_id: user.id, candidate: evt.candidate });
            }
        }
        user.pc.onaddstream = function (evt) {
            user.pv.src = URL.createObjectURL(evt.stream);
            user.pv.play();
        }
        //user.pc.onremovestream = function () { console.log('pc.onremovestream', arguments); }
        user.pc.addStream(this.localstream);
    },

    doCandidate: function (data) {
        var user = joined_users.get(data.from_id);
        if (user) user.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    },

    doOffer: function (data) {
        var user = joined_users.get(data.from_id);
        if (user) {
            user.pc.setRemoteDescription(new RTCSessionDescription(data.offer), function () {
                user.pc.createAnswer(function (answer) {
                    console.log('createAnswer', answer);
                    user.pc.setLocalDescription(answer, function () {
                        socket.emit('message', { event: 'webrtc', signal: 'answer', from_id: myid, to_id: user.id, 'answer': answer });
                    }, logError);
                });
            }, logError);
        }
    },

    doAnswer: function (data) {
        var user = joined_users.get(data.from_id);
        if (user) user.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
});

Ext.define('wbs', {
    singleton: true,
    map: new Ext.util.HashMap(),

    add: function (id, url) {
        var title = strings.wb;
        var wb = this.create(myid, id, title, url, true);
        this.emit({ signal: 'new', id: wb.id, 'title': title, 'url': url, creater: wb.creater });
        return wb;
    },

    openM: function () {
        var me = this;

        function onOk(btn) {
            var form = btn.up('form').getForm();
            if (form.isValid()){
                form.submit({
                    url: '/unoconv',
                    success: function(f, act){
                        me.add(me.id(), act.result.uri);
                        btn.up('window').close();
                    },
                    failure: function(f, act){
                        alert('failed');
                    }
                });
            }
        }

        Ext.create('Ext.window.Window', {
            title: strings.wb_open_title,
            width: 450,
            items: [{
                xtype: 'form',
                bodyPadding: 10,
                border: 0,
                layout: 'form',
                items: [{
                    xtype: 'filefield',
                    allowBlank: false,
                    emptyText: strings.wb_open_empty,
                    name: 'file',
                    buttonText: '...'
                }],
                buttons: [
                    { text: strings.ok, handler: onOk, },
                    { text: strings.cancel, handler: function (btn) { btn.up('window').close(); } }
                ]
            }]
        }).show();
    },

    create: function (creater, id, title, url, closable) {
        id = id || this.id()
        var wb = Ext.create('WB', { 'id': id, 'creater': creater, 'url': url });
        var tab = Ext.create('Ext.panel.Panel', {
            'title': title,
            itemId: id,
            'closable': closable,
            tbar: [
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
                    store: {
                        type: 'store',
                        fields: ['page_no'],
                        data: [{page_no: 1}]
                    },
                    disabled: !closable,
                    queryMode: 'local',
                    displayField: 'page_no',
                    value: 1,
                    editable: false
                }
            ],
            autoScroll: true,
            html: '<canvas></canvas>'
        });
        getViewport().down('#wb-tabs').add(tab);
        tab.on('render', function () { wb.init(tab); });
        getViewport().down('#wb-tabs').setActiveTab(tab);
        return this.map.add(id, wb);
    },

    close: function (id) {
        var wb = this.get(id);
        if (wb) {
            wb.tab.close();
            this.map.removeAtKey(id);
        }
    },

    id: function () { return Ext.id(); },

    get: function (id) { return this.map.get(id); },

    del: function (id) {
        this.map.removeAtKey(id);
        return this.emit({ signal: 'del', 'id': id });
    },

    emit: function (data) {
        Ext.apply(data, { event: 'wbs' });
        socket.emit('message', data);
        return this;
    },

    signal: function (data) {
        switch (data.signal) {
            case 'new':
                this.create(data.creater, data.id, data.title, data.url, false);
                break;
            case 'del':
                this.close(data.id);
                break;
            case 'draw':
                var wb = this.get(data.id);
                if (wb) {
                    var l = wb.getPage(data.page).getLayer(data.layer);
                    var o = Ext.create(data.shape.type);
                    l.push(o.unpack(data.shape));
                    wb.render();
                }
                break;
        }
    }
});

Ext.define('WB', {
    statics: {
        DrawMode: {
            None: 'WB.None',
            Pen: 'WB.Pen',
            Line: 'WB.Line',
            Rect: 'WB.Rect'
        }
    },

    constructor: function (config) {
        config = config || {};
        this.id = config.id;
        this.creater = config.creater;
        this.url = config.url;
        this.tab = config.tab;
        this.canvas = null;
        this.ctx = null;
        this.pdf = null;
        this.pdf_page = null;
        this.scale = 2.0;
        this.drawShape = null;
        this.drawMode = WB.DrawMode.Pen;
        this.pages = new Ext.util.HashMap();
        this.activePageId = 1;
        this.numPages = 1;
        if (this.creater == myid) this.color = '#FF0000';
        else this.color = '#0000FF';
    },

    render: function (mousemoving) {
        var me = this;
        me.ctx.clearRect(0, 0, me.canvas.width, me.canvas.height);
        if (me.pdf_page){
            me.pdf_page.render({
                canvasContext: me.ctx,
                viewport: me.pdf_page.getViewport(me.scale)
            }).then(function(){
                console.log(arguments);
                this.getActivePage().draw(me.ctx);
                if (me.drawShape) {
                    me.drawShape.draw(me.ctx);
                }
            });
        } else {
            this.getActivePage().draw(me.ctx);
            if (me.drawShape) {
                me.drawShape.draw(me.ctx);
            }
        }
        return me;
    },

    getPage: function (id) {
        if (!this.pages.containsKey(id)) {
            var page = Ext.create('WB.Page', { wb: this, 'id': id });
            this.pages.add(id, page);
        }
        return this.pages.get(id);
    },

    getActivePage: function () {
        return this.getPage(this.activePageId);
    },

    gotoPage: function (pageId) {
        this.activePageId = pageId;
        if (this.pdf) {
            tihs.loadPage(pageId);
        } else {
            this.render();
        }
    },

    undo: function () { return this; },

    redo: function () { return this; },

    clear: function () { return this; },

    reset: function () { return this; },

    loadPdf: function(){
        var me = this;
        if (me.url) {
            PDFJS.getDocument(me.url).then(function(pdf){
                me.pdf = pdf; me.loadPage();
                me.numPages = pdf.numPages;
            });
        }
    },

    loadPage: function(pageId){
        var me = this;
        pageId = pageId || 1;
        if (me.pdf){
            me.pdf.getPage(pageId).then(function(page){
                me.pdf_page = page;
                var vp = page.getViewport(me.scale);
                me.canvas.setAttribute('width', vp.width);
                me.canvas.setAttribute('height', vp.height);
                me.render();
            });
        }
    },

    bind: function(){
        var me = this;
    },

    init: function (panel) {
        var me = this;

        panel.wb = me;
        me.tab = panel;
        me.canvas = panel.el.dom.getElementsByTagName('canvas')[0];
        panel.down('#wb-tb-color').on('render', function (c) {
            c.el.dom.getElementsByTagName('span')[0].style.backgroundColor = me.color;
        });
        panel.on('resize', function (c, w, h) {
            if (me.page == null) {
                me.canvas.setAttribute('width', w);
                me.canvas.setAttribute('height', h);
                me.render();
            }
        });
        panel.on('close', function () {
            if (me.creater == myid) {
                wbs.del(me.id);
            }
        });
        me.ctx = me.canvas.getContext('2d');

        me.canvas.onselectstart = function () { return false; }

        function validDrawMode() {
            return ((me.drawMode === WB.DrawMode.Pen)
            || (me.drawMode === WB.DrawMode.Line)
            || (me.drawMode === WB.DrawMode.Rect));
        }

        var capture = false;
        me.canvas.onmousedown = function (e) {
            if (!validDrawMode()) return;
            capture = true;
            me.drawShape = Ext.create(me.drawMode, { color: me.color });
            me.drawShape.mousedown(e);
        }
        me.canvas.onmousemove = function (e) {
            if (!validDrawMode()) return;
            if (capture && me.drawShape) {
                me.drawShape.mousemove(e);
                me.render(true);
            }
        }
        me.canvas.onmouseup = function (e) {
            if (!validDrawMode()) return;
            if (capture && me.drawShape) {
                me.drawShape.mouseup(e);
                me.getActivePage().getLayer(myid).push(me.drawShape);
                wbs.emit({ signal: 'draw', id: me.id, page: me.activePageId, layer: myid, shape: me.drawShape.pack(), x: e.offsetX, y: e.offsetY });
                me.drawShape = null;
                me.render();
            }
            capture = false;
        }
        me.canvas.onmouseout = function (e) {
            capture = false;
        }

        me.loadPdf();

        return me;
    }
});

Ext.define('WB.Page', {
    constructor: function (config) {
        config = config || {};
        this.wb = config.wb;
        this.id = config.id;
        this.layers = new Ext.util.HashMap();
    },

    draw: function (ctx) {
        var me = this;
        me.layers.each(function (key, val) {
            val.draw(ctx);
        });
    },

    getLayer: function (id) {
        var layers = this.layers;
        if (!layers.containsKey(id)) {
            var layer = Ext.create('WB.Layer', { page: this, 'id': id });
            return layers.add(id, layer);
        }
        return layers.get(id);
    },

    undo: function () { return this; },

    redo: function () { return this; },

    clear: function () { return this; },

    reset: function () { return this; }
});

Ext.define('WB.Layer', {
    constructor: function (config) {
        config = config || {};
        this.page = config.page;
        this.id = config.id;
        this.figures = [];
        this.undolst = [];
    },

    undo: function () {
        if (this.figures.length > 0)
            this.undolst.push(this.figures.pop());
        return this;
    },

    redo: function () {
        if (this.undolst.length > 0)
            this.figures.push(this.undolst.pop());
        return this;
    },

    push: function (o) {
        this.figures.push(o);
        return this;
    },

    pop: function () {
        return this.figures.pop();
    },

    clear: function () {
        this.figures = [];
        this.undolst = [];
        return this;
    },

    draw: function (ctx) {
        Ext.Array.each(this.figures, function (v) {
            if (v) v.draw(ctx);
        });
    }
});

Ext.define('WB.Shape', {
    constructor: function (config) {
        config = config || {};
        this.width = config.width || 2;
        this.color = config.color || '#FF0000';
    },

    stroke: function (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }
});

Ext.define('WB.Pen', {
    extend: 'WB.Shape',

    statics: {
        Type: 'WB.Pen'
    },

    constructor: function (config) {
        this.points = [];
        this.callParent(arguments);
    },

    pack: function () {
        return {
            type: WB.Pen.Type,
            width: this.width,
            color: this.color,
            points: this.points
        };
    },

    unpack: function (o) {
        this.width = o.width;
        this.color = o.color;
        this.points = o.points;
        return this;
    },

    draw: function (ctx) {
        var points = this.points;
        if (points.length < 2) return;

        var p1 = points[0];
        var p2 = points[1];

        ctx.beginPath();
        for (var i = 1; i < points.length; ++i) {

            if (i == 1) ctx.moveTo(p1.x, p1.y);

            ctx.quadraticCurveTo(p1.x, p1.y, p1.x + (p2.x - p1.x) / 2, p1.y + (p2.y - p1.y) / 2);

            p1 = this.points[i];
            p2 = this.points[i + 1];
        }
        this.stroke(ctx);

        return this;
    },

    mousedown: function (e) {
        this.points.push({ x: e.offsetX, y: e.offsetY });
        return this;
    },

    mousemove: function (e) {
        this.points.push({ x: e.offsetX, y: e.offsetY });
        return this;
    },

    mouseup: function (e) {
        this.points.push({ x: e.offsetX, y: e.offsetY });
        return this;
    }
});

Ext.define('WB.Line', {
    extend: 'WB.Shape',

    statics: {
        Type: 'WB.Line'
    },

    constructor: function (config) {
        this.points = [];
        this.callParent(arguments);
    },

    pack: function () {
        return {
            type: WB.Line.Type,
            width: this.width,
            color: this.color,
            points: this.points
        };
    },

    unpack: function (o) {
        this.width = o.width;
        this.color = o.color;
        this.points = o.points;
        return this;
    },

    draw: function (ctx) {
        if (this.points.length == 0) {
            return;
        }
        var p = this.points[0];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        for (var i = 1; i < this.points.length; i++) {
            p = this.points[i];
            ctx.lineTo(p.x, p.y);
        }
        this.stroke(ctx);
        ctx.closePath();
    },

    mousedown: function (e) {
        this.points = [];
        this.points.push({ x: e.offsetX, y: e.offsetY });
        return this;
    },

    mousemove: function (e) {
        if (this.points.length > 1) this.points.pop();
        this.points.push({ x: e.offsetX, y: e.offsetY });
        return this;
    },

    mouseup: function (e) {
        if (this.points.length > 1) this.points.pop();
        this.points.push({ x: e.offsetX, y: e.offsetY });
        return this;
    }
});

Ext.define('WB.Rect', {
    extend: 'WB.Shape',

    statics: {
        Type: 'WB.Rect'
    },

    constructor: function (config) {
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.callParent(arguments);
    },

    pack: function () {
        return {
            type: WB.Rect.Type,
            width: this.width,
            color: this.color,
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        };
    },

    unpack: function (o) {
        this.width = o.width;
        this.color = o.color;
        this.x = o.x;
        this.y = o.y;
        this.w = o.w;
        this.h = o.h;
        return this;
    },

    draw: function (ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        this.stroke(ctx);
    },

    mousedown: function (e) {
        this.x = e.offsetX;
        this.y = e.offsetY;
        return this;
    },

    mousemove: function (e) {
        this.w = e.offsetX - this.x;
        this.h = e.offsetY - this.y;
        return this;
    },

    mouseup: function (e) {
        this.w = e.offsetX - this.x;
        this.h = e.offsetY - this.y;
        return this;
    }
});