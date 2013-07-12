var port = 1339;
var root = 'E:/project/iwebrtc/ui-extjs';
//var root = '/opt/iwebrtc/ui-extjs';
var upload = '/upload/';

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var unoconv = require('unoconv');

console.log('Listening at: ws://0.0.0.0:' + port);

app.listen(port);

var ErrCode = {
	NoError: 0,
	NotSupportedType: 1001,
	ConvertToPdfFailed: 1002
};

Date.prototype.format = function (fmt) {
    var y = this.getFullYear().toString();
    var m = (this.getMonth() + 1).toString();
    var d = this.getDate().toString();
    var h = this.getHours().toString();
    var i = this.getMinutes().toString();
    var s = this.getSeconds().toString();

    var out = '';
    for (var j = 0; j < fmt.length; j++) {
        var c = fmt.charAt(j);
        switch (c) {
            case 'Y':
                out += y;
                break;
            case 'm':
                out += (m.length > 1) ? m : ('0' + m);
                break;
            case 'd':
                out += (d.length > 1) ? d : ('0' + d);
                break;
            case 'H':
                out += (h.length > 1) ? h : ('0' + h);
                break;
            case 'i':
                out += (i.length > 1) ? i : ('0' + i);
                break;
            case 's':
                out += (s.length > 1) ? s : ('0' + s);
                break;
            default:
                out += c;
                break;
        }
    }
    return out;
}

function handler(req, res) {
	var url = require('url').parse(req.url, true);
	var pathname = url.pathname;
	if (/\/$/.test(pathname)) {
		pathname += 'index.html';
	}
	if (req.method == 'POST') {
		if (pathname == '/unoconv') {
			var form = new formidable.IncomingForm();
			form.encoding = 'utf-8';
			form.keepExtensions = true;
			form.maxFieldsSize = 2 * 1024 * 1024;

			var rsp = {};
			rsp.success = true;
			rsp.uri = '';
			rsp.ec = ErrCode.NoError;
			
			function sendRsp(){
				res.writeHead(200, {'content-type': 'text/plain'});
				res.write(JSON.stringify(rsp));
				res.end();
			}

			form.parse(req, function(err, fields, files){
			});
			form.on('file', function(name, file) {
				var new_name = (new Date()).format('YmdHis') + '.pdf';
				rsp.uri = upload + new_name;
				if (/[.]pdf$/.test(file.name)) {
					fs.readFile(file.path, function(err, data){ fs.writeFile(root + upload + new_name, data); });
				} else if (/[.]doc$|[.]docx$/.test(file.name)) {
					unoconv.convert(file.path, 'pdf', function(err, result){
						if (err) {
							rsp.success = false;
							rsp.ec = ErrCode.ConvertToPdfFailed;
							rsp.detail = err;
						} else {
							fs.writeFile(root + upload + new_name, result);
						}
						sendRsp();
					});
					return;
				} else {
					rsp.success = false;
					rsp.ec = ErrCode.NotSupportedType;
				}
				sendRsp();
			});
		}
		return;
	}
	var path = root + pathname;
	fs.readFile(path, function(err, data){
		if (err) {
			res.writeHead(500);
			return res.end('Error loading ' + url);
		}
		var o = {};
		if (/[.]html$/.test(pathname)) {
			o['Content-Type'] = 'text/html';
		} else if (/[.]js$/.test(pathname)) {
			o['Content-Type'] = 'text/javascript';
		} else if (/[.]css$/.test(pathname)) {
			o['Content-Type'] = 'text/css';
		}
		if (/pdf[.]js$/.test(pathname)
			|| /ext-all[.]js$/.test(pathname)
			|| /socket.io.min[.]js$/.test(pathname)
			|| /json2[.]js$/.test(pathname)
			|| /ext-theme-neptune-all[.]css$/.test(pathname)) {
			o['Content-Encoding'] = 'gzip';
		}
		o['Cache-Control'] = 'max-age=604800';
		res.writeHead(200, o);
		res.end(data);
	});
}

var room_no = -1;
var rooms = [];

for(var i=0; i<4; i++) {
	room_no++;
	rooms[room_no] = {};
	rooms[room_no].no = room_no;
	rooms[room_no].name = 'Test Room ' + (i+1);
	rooms[room_no].users = [];
}

io.sockets.on('connection', function(socket){
	console.log("Connection " + socket.id + " accepted.");
	
	socket.emit('session', { id: socket.id });
	
	socket.on('disconnect', function(){
		var room = rooms[socket.no];
		if (room) {
			var index = -1;
			for(var i=0; i<room.users.length; i++) {
				var user = room.users[i];
				if (user.id != socket.id) {
					user.sock.emit('leave_user', { id: socket.id });
				} else {
					index = i;
				}
			}
			if (index != -1) room.users.splice(index, 1);
		}
		
		console.log("Connection " + socket.id + " terminated.");
	});
	
	//create room
	socket.on('create', function(data){
		++room_no;
		var room = {};
		room.no = room_no;
		room.name = data.name;
		room.users = [];
		rooms[room_no] = room;
		socket.emit('create_ok', { no: room.no, name: room.name });
	});
	
	//list rooms
	socket.on('list', function(data){
		var rs = [];
		for(var i=0; i<rooms.length; i++) {
			var room = rooms[i];
			rs.push({
				no: room.no,
				name: room.name,
				users: room.users.length
			});
		}
		socket.emit('list_ok', rs);
	});
	
	socket.on('info', function(data){
		var room = rooms[data.no];
		if (!room) {
			socket.emit('error', 'room not exist');
		} else {
			socket.emit('info_ok', { name: room.name });
		}
	});
	
	//join room
	socket.on('join', function(data){
		var room = rooms[data.no];
		if (!room) {
			socket.emit('error', 'room not exist');
		} else {
			socket.no = data.no;
			var users = [];
			for(var i=0; i<room.users.length; i++) {
				var user = room.users[i];
				users.push({
					id: user.id,
					name: user.name
				});
				user.sock.emit('join_user', { id: socket.id, name: data.name });
			}
			
			room.users.push({
				id: socket.id,
				sock: socket,
				name: data.name
			});
			
			socket.emit('join_ok', users);
		}
	});
	
	//leave room
	socket.on('leave', function(data){
		var room = rooms[socket.no];
		if (!room) {
			socket.emit('error', 'room not exist');
		} else {
			socket.no = null;
			var index = -1;
			for(var i=0; i<room.users.length; i++) {
				var user = room.users[i];
				if (user.id != socket.id) {
					user.sock.emit('leave_user', { id: socket.id });
				} else {
					index = i;
				}
			}
			if (index != -1) room.users.splice(index, 1);
			socket.emit('leave_ok', {});
		}
	});
	
	//delete room
	socket.on('delete', function(data){
		var room = rooms[data.no];
		if (!room) {
			socket.emit('error', 'room not exist');
		} else {
			for(var i=0; i<room.users.length; i++) {
				room.users[i].socket.no = null;
				room.users[i].socket.emit('delete_room', { no: data.no });
			}
			for(var i=0; i<rooms.length; i++) {
				if (room[i].no == data.no) {
					rooms.splice(i, 1);
					break;
				}
			}
			socket.emit('delete_ok', {});
		}
	});
	
	//forward message
	socket.on('message', function(data){
		console.log("Received message: " + data + " - from client " + socket.id);
		var room = rooms[socket.no];
		if (!room) {
			socket.emit('error', 'Has not yet been join a room.');
		}
		if (!data.to_id) {
			socket.broadcast.emit('message', data)
		} else {
			for(var i=0; i<room.users.length; i++) {
				if (room.users[i].id == data.to_id) {
					room.users[i].sock.emit('message', data);
					break;
				}
			}
		}
	});
});