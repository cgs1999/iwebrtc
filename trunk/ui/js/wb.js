var wbs = function () {
    var map = new HashTable();
    var counter = 0;
    return {
        add: function (id) {
            var wb = this.create(id);
            this.emit({ signal: 'new', id: wb.id });
            return wb;
        },
        create: function (id) {
            var id = id || this.id();
            var wb = new WB(id);
            var ux = ui.add_wb(id);
            wb.init(ux[0], ux[1]);
            return map.add(id, wb);
        },
        close: function (id) {
        },
        id: function () {
            return (Math.random() * 10e17).toString();
        },
        get: function (id) {
            return map.get(id);
        },
        del: function (id) {
            this.close(id);
            return this.emit({ signal: 'del', 'id': id });
        },
        emit: function (data) {
            apply(data, { event: 'wbs' });
            socket.emit('message', data);
            return this;
        },
        signal: function (data) {
            switch (data.signal) {
                case 'new':
                    wbs.create(data.id);
                    break;
                case 'del':
                    wbs.close(data.id);
                    break;
                case 'draw':
                    var wb = wbs.get(data.id);
                    var l = wb.getLayer(data.layer);
                    var o = eval('new {0}()'.format(data.shape.type));
                    l.push(o.unpack(data.shape));
                    wb.render();
                    break;
            }
        }
    };
} ();

function WB(id) {
    this.id = id;
    this.canvas = null;
    this.ctx = null;
    this.head = null;
    this.body = null;
    this.drawMode = WB.DrawMode.Pen;
    this.drawShape = null;
    this.layers = new HashTable();
}
WB.prototype.render = function (mousemoving) {
    var me = this;
    this.layers.each(function (ht, key, value) {
        value.draw(me.ctx);
    });
    if (this.drawShape != null) {
        this.drawShape.draw(me.ctx);
    }
    return this;
}
WB.prototype.getLayer = function (id) {
    var layers = this.layers;
    if (!layers.containsKey(id)) {
        return layers.add(id, new WB.Layer(this, id));
    }
    return layers.get(id);
}
WB.prototype.undo = function () {
    return this;
}
WB.prototype.redo = function () {
    return this;
}
WB.prototype.clear = function () {
    return this;
}
WB.prototype.reset = function () {
    return this;
}
WB.prototype.init = function (head, body) {
    this.head = head;
    this.body = body;
    this.canvas = body.find('canvas')[0];
    this.ctx = this.canvas.getContext('2d');

    this.canvas.onselectstart = function () { return false; }

    var me = this;
    function validDrawMode() {
        return ((me.drawMode === WB.DrawMode.Pen)
            || (me.drawMode === WB.DrawMode.Line)
            || (me.drawMode === WB.DrawMode.Rect));
    }

    var capture = false;
    this.canvas.onmousedown = function (e) {
        if (!validDrawMode()) return;
        capture = true;
        me.drawShape = eval('new {0}()'.format(me.drawMode));
        me.drawShape.parent = me.getLayer(myid);
        me.drawShape.mousedown(e);
    }
    this.canvas.onmousemove = function (e) {
        if (!validDrawMode()) return;
        if (capture && me.drawShape) {
            me.drawShape.mousemove(e);
            me.render(true);
        }
    }
    this.canvas.onmouseup = function (e) {
        if (!validDrawMode()) return;
        if (capture && me.drawShape) {
            me.drawShape.mouseup(e);
            me.drawShape.parent.push(me.drawShape);

            wbs.emit({ signal: 'draw', id: me.id, layer: myid, shape: me.drawShape.pack(), x: e.offsetX, y: e.offsetY });

            me.drawShape = null;
            me.render();
        }
        capture = false;
    }
    this.canvas.onmouseout = function (e) {
        capture = false;
    }

    return this;
}

WB.DrawMode = {
    None: 'WB.None',
    Pen: 'WB.Pen',
    Line: 'WB.Line',
    Rect: 'WB.Rect'
}

WB.Layer = function (wb, id) {
    this.id = id;
    this.wb = wb;
    this.figures = [];
    this.undolst = [];
}
WB.Layer.prototype.undo = function () {
    if (this.figures.length > 0) {
        this.undolst.push(this.figures.pop());
    }
    return this;
}
WB.Layer.prototype.redo = function () {
    if (this.undolst.length > 0) {
        this.figures.push(this.undolst.pop());
    }
    return this;
}
WB.Layer.prototype.push = function (o) {
    this.figures.push(o);
    return this;
}
WB.Layer.prototype.pop = function () {
    return this.figures.pop();
}
WB.Layer.prototype.clear = function () {
    this.figures = [];
    this.undolst = [];
    return this;
}
WB.Layer.prototype.draw = function (ctx) {
    var figures = this.figures;
    for (var i = 0; i < figures.length; ++i) {
        if (figures[i]) figures[i].draw(ctx);
    }
}

WB.Shape = function() {
    this.width = 2;
    this.color = '#FF0000';
}
WB.Shape.prototype.stroke = function (ctx) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = this.width;
    ctx.strokeStyle = this.color;
    ctx.stroke();
}

WB.Pen = function (p) {
    WB.Shape.call(this);
    this.parent = p;
    this.type = 'WB.Pen';
    this.points = [];
}
extend(WB.Pen, WB.Shape);
WB.Pen.prototype.pack = function () {
    return {
        type: this.type,
        width: this.width,
        color: this.color,
        points: this.points
    };
}
WB.Pen.prototype.unpack = function (o) {
    this.width = o.width;
    this.color = o.color;
    this.points = o.points;
    return this;
}
WB.Pen.prototype.draw = function (ctx) {
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
}
WB.Pen.prototype.mousedown = function (e) {
    this.points.push({ x: e.offsetX, y: e.offsetY });
    return this;
}
WB.Pen.prototype.mousemove = function (e) {
    this.points.push({ x: e.offsetX, y: e.offsetY });
    return this;
}
WB.Pen.prototype.mouseup = function (e) {
    this.points.push({ x: e.offsetX, y: e.offsetY });
    return this;
}

