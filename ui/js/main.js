var ws_serv = 'ws://192.168.1.104:1339';

socket = null;

var joined_room = {};
joined_room.no = request['no'];

var joined_users = [];
function join_user(user) {
    user.pc = null;
    user.ui = ui.add_usr(user.name);
    user.pv = user.ui.find('video')[0];
    joined_users.push(user);
    return user;
}
function get_user(id) {
    for (var i = 0; i < joined_users.length; i++) {
        if (joined_users[i].id == id)
            return joined_users[i];
    }
    return null;
}
function leave_user(id) {
    for (var i = 0; i < joined_users.length; i++) {
        if (joined_users[i].id == id) {
            joined_users[i].pc.close();
            joined_users[i].ui.remove();
            joined_users.splice(i, 1);
            return;
        }
    }
}
function leave_room() {
    for (var i = 0; i < joined_users.length; i++) {
        joined_users[i].pc.close();
        joined_users[i].ui.remove();
    }
    joined_users = [];
}

myid = null;
myname = request['name'] || 'Anonymous';

var main = function () {
    rtc.init(function () {
        main.connect();
    });
};
main.connect = function () {
    socket = io.connect(ws_serv);
    socket.on('connect', function () { console.log('connect to websocket server') });
    socket.on('disconnect', function () { console.log('disconnect to websocket server') });
    socket.on('session', function (data) { myid = data.id; });
    socket.on('info_ok', function (data) {
        joined_room = apply(joined_room, data);
        socket.emit('join', { no: joined_room.no, name: myname });
    });
    socket.on('join_user', function (data) {
        console.log(data);
        join_user(data);
    });

    socket.on('join_ok', function (data) {
        for (var i = 0; i < data.length; i++) {
            rtc.startM(join_user(data[i]));
        }
    });
    socket.on('leave_user', function (data) {
        console.log(data);
        leave_user(data.id);
    });
    socket.on('leave_ok', function (data) { console.log(data); });
    socket.on('message', function (data) {
        switch (data.event) {
            case 'webrtc':
                rtc.signal(data);
                break;
            default:
                console.log(data);
                break;
        }
    });

    socket.on('error', function (data) { console.log(data); });

    socket.emit('info', { no: joined_room.no });
}

