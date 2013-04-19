var port = 1339;
var io = require('socket.io').listen(port);

console.log('Listening at: ws://0.0.0.0:' + port);

var room_no = -1;
var rooms = [];

room_no++;
rooms[room_no] = {};
rooms[room_no].no = room_no;
rooms[room_no].name = 'Test Room';
rooms[room_no].users = [];

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