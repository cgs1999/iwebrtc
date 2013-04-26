var ws_serv = 'ws://127.0.0.1:1339';

socket = null;

var joined_room = {};
joined_room.no = request['no'];

var joined_users = [];
function join_user(user) {
    chat.sys(strings.joinuser.format(user.name));

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
            chat.sys(strings.leaveuser.format(joined_users[i].name));

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
    chat.sys(strings.leaveroom);
}

myid = null;
myname = request['name'] || strings.anonymous;

var chat = {
    emit: function (msg) {
        //var dt = new Date().format('Y-m-d H:i:s');
        var dt = new Date().format('H:i:s');
        socket.emit('message', { event: 'chat', from: myname, time: dt, text: msg });
        ui.add_my_msg(dt, myname, msg);
    },
    signal: function (data) {
        ui.add_user_msg(data.time, data.from, data.text);
    },
    sys: function (msg) {
        ui.add_sys_msg(msg);
    }
}

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
            default:
                console.log(data);
                break;
        }
    });

    socket.on('error', function (data) { console.log(data); });

    socket.emit('info', { no: joined_room.no });
}

