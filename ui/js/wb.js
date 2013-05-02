var wbs = function () {
    var map = new HashTable();
    var counter = 1;
    return {
        get: function () {
        },
        del: function () {
        },
        emit: function (data) {
            apply(data, { event: 'wb', uid: myid });
            socket.emit('message', data);
        },
        signal: function (data) {
        }
    };
}

function WB(id) {
    this.id = id;
    this.canvas = null;
    this.ctx = null;
    this.head = null;
    this.body = null;
    this.layers = new HashTable();
}
WB.prototype.render = function () {
    return this;
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
WB.prototype.create = function (head, body) {
    this.head = head;
    this.body = body;
    this.canvas = body.find('canvas')[0];
    this.ctx = this.canvas.getContext('2d');
    return this;
}
WB.prototype.init = function () {
    return this;
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
    this.width = 3;
    this.color = 'red';
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
    this.type = 'WBPen';
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

