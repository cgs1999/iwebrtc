var VK_ENTER = 13;

var ui = {};

ui.add_sys_msg = function (msg) {
    //var dt = new Date().format('Y-m-d H:i:s');
    var dt = new Date().format('H:i:s');
    ui.add_msg(dt, strings.system, msg).find('.msg-title').addClass('msg-system');
}

ui.add_my_msg = function (dt, name, msg) {
    ui.add_msg(dt, name, msg).find('.msg-title').addClass('msg-myself');
}

ui.add_user_msg = function (dt, name, msg) {
    ui.add_msg(dt, name, msg).find('.msg-title').addClass('msg-user');
}

ui.add_msg = function (dt, name, msg) {
    var tpl = '<div class="ui-widget msg-item"><div class="ui-widget msg-title"><label>#{datetime}</label>&nbsp;&nbsp;<label>#{name}</label></div><div class="ui-widget"><label>#{message}</label></div></div>';
    var div = $(tpl.replace(/#\{datetime\}/g, dt).replace(/#\{name\}/g, name).replace(/#\{message\}/g, msg));
    $('#chat-history-ct').append(div);
    $('#chat-history-ct').scrollTop($('#chat-history-ct')[0].scrollHeight);

    div.hover(function () {
        $(this).addClass("msg-item-hover");
    }, function () {
        $(this).removeClass("msg-item-hover");
    });
    return div;
}

ui.emit_chat = function () {
    if ($('#speaking').val()) {
        chat.emit($('#speaking').val());
    }
    $('#speaking').val('');
}

ui.active_wb = function (index) {
    console.log(index);
    $("#wbs-tabs").tabs("option", "active", index || 0);
},

ui.remove_wb = function (head, body) {
    head.remove();
    body.remove();
    $("#wbs-tabs").tabs("refresh");
},

ui.add_wb = function (id, title, closable) {
    var label = title || strings.whiteboard;
    var tpl = "<li><a href='#wbs-#{id}'>#{label}</a><span class='ui-icon ui-icon-close' role='presentation'></span></li>";
    var li = $(tpl.replace(/#\{id\}/g, id).replace(/#\{label\}/g, label));
    if (!closable) li.find('span').hide();

    tpl = "<div id='wbs-#{id}' class='body'><div class='toolbar'><div class='shape'></div></div><canvas></canvas></div>";
    var body = $(tpl.replace(/#\{id\}/g, id));

    tpl = "<input type='radio' id='wbs-#{shape}-#{id}' class='#{shape}' name='shape'/><label for='wbs-#{shape}-#{id}'></label>";

    var tbPen = $(tpl.replace(/#\{id\}/g, id).replace(/#\{shape\}/g, 'pen'));
    body.find('.toolbar .shape').append(tbPen);
    var tbLine = $(tpl.replace(/#\{id\}/g, id).replace(/#\{shape\}/g, 'line'));
    body.find('.toolbar .shape').append(tbLine);
    var tbRect = $(tpl.replace(/#\{id\}/g, id).replace(/#\{shape\}/g, 'rect'));
    body.find('.toolbar .shape').append(tbRect);
    body.find('.toolbar .shape').buttonset();
    body.find('.toolbar .shape .pen').button({ text: false, label: strings.wb_pen, icons: { primary: "ui-icon-pencil"} });
    body.find('.toolbar .shape .line').button({ text: false, label: strings.wb_pen, icons: { primary: "ui-icon-pencil"} });
    body.find('.toolbar .shape .rect').button({ text: false, label: strings.wb_pen, icons: { primary: "ui-icon-pencil"} });

    var tbColor = $('<div style="float:right" class="color-sel ui-button ui-corner-all"><input type="text"/></div>');
    tbColor.find('input').spectrum({
        preferredFormat: 'hex6',
        showInput: true
    });
    body.find('.toolbar').append(tbColor);

    $("#wbs-tabs").find(".ui-tabs-nav").append(li);
    $("#wbs-tabs").append(body);
    $("#wbs-tabs").tabs("refresh");

    body.find('canvas').width(body.width() - 10).height(body.height() - 42);
    body.find('canvas')[0].setAttribute('width', body.width() - 10);
    body.find('canvas')[0].setAttribute('height', body.height() - 42);

    return [li, body];
}

ui.add_usr = function (name) {
    name = name || strings.anonymous;

    var tpl = '<div class="ui-widget-content ui-corner-all"><h3 class="ui-widget-header ui-corner-all">#{name}</h3><center><video width="320" height="240"></video></center></div>';
    var div = $(tpl.replace(/#\{name\}/g, name));
    $('#usrs-ct').append(div);

    div.find('h3').dblclick(function () {
        div.find('center').toggle('blind', {}, 300);
    });

    return div;
}

ui.resize = function () {
    var chat_height = 250;
    var h = window.innerHeight - $('#tb-ct').height() - 20;
    $('#hole-ct').height(h);
    $('#wbs-tabs').height(h - chat_height - 10);
    $("#wbs-tabs").tabs("refresh");

    $('#chat-ct').height(chat_height);
    $('#speaking').width($('#chat-speak-ct').width() - 75);
    $('#chat-history-ct').height(chat_height - $('#chat-speak-ct').height() - 50);

    $('#usrs-ct').height(h);
}

ui.init = function () {
    $("#new-wb").button({ text: false, label: strings.wb_new, icons: { primary: "ui-icon-document"} })
        .click(function () { wbs.add(); });
    $("#open-wb").button({ text: false, label: strings.wb_open, icons: { primary: "ui-icon-folder-open"} });

    $("#wbs-tabs").tabs({
        heightStyle: "fill",
        activate: function (e, ui) {
            console.log($(ui.newTab[0]).find('span').css('display'), ui.newPanel[0].id);
        }
    })
    .delegate("span.ui-icon-close", "click", function () {
        var id = $(this).closest("li").attr("aria-controls");
        wbs.del(id.substr(4));
    });
    $("#wbs-tabs").first().find('.ui-tabs-nav a').html(strings.wb_0_title);
    $("#wbs-tabs").first().find('div div').html(strings.wb_0_body)

    $('#chat-ct').find('h3').html(strings.message);
    $("#send_speak").button({ text: false, label: strings.send_speak, icons: { primary: "ui-icon-comment"} }).click(function () {
        ui.emit_chat();
    });
    $('#speaking').keydown(function (e) {
        if (e.keyCode == VK_ENTER) {
            ui.emit_chat();
        }
    });

    $(document).tooltip();

    ui.resize();

    ui.add_sys_msg(strings.welcome.format(myname));
}

$(window).resize(ui.resize);
