var ui = {
    wb: {
        tabs: null,
        counter: 1,
        tpl: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>"
    },
    usr: {
        tpl: '<div class="ui-widget-content ui-corner-all"><h3 class="ui-widget-header ui-corner-all">#{name}</h3><center><video width="320" height="240"></video></center></div>'
    },
    chat: {
        tpl: '<div class="ui-widget msg-item"><div class="ui-widget"><label>#{datetime}</label><label>#{name}</label></div><div class="ui-widget"><label>#{message}</label></div></div>'
    }
};

ui.add_sys_msg = function (msg) {
    var dt = new Date().format('Y-m-d H:i:s');
    var name = '系统';

    var div = $(ui.chat.tpl.replace(/#\{datetime\}/g, dt).replace(/#\{name\}/g, name).replace(/#\{message\}/g, msg));

    $('#chat-history-ct').append(div);
}

ui.add_wb = function (title) {
    var label = title || "白板 " + ui.wb.counter,
	id = "wbs-" + ui.wb.counter,
	li = $(ui.wb.tpl.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, label));

    ui.wb.tabs.find(".ui-tabs-nav").append(li);
    ui.wb.tabs.append("<div id='" + id + "'></div>");
    ui.wb.tabs.tabs("refresh");

    ui.wb.counter++;
}

ui.add_usr = function (name) {
    name = name || 'Anonymous';

    var div = $(ui.usr.tpl.replace(/#\{name\}/g, name));
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
    ui.wb.tabs.tabs("refresh");

    $('#chat-ct').height(chat_height);
    $('#speaking').width($('#chat-speak-ct').width() - 65);
    $('#chat-history-ct').height(chat_height - $('#chat-speak-ct').height() - 50);

    $('#usrs-ct').height(h);
}

ui.init = function () {
    $("#new-wb").button({ text: false, icons: { primary: "ui-icon-document"} }).click(function () { ui.add_wb(); });
    $("#open-wb").button({ text: false, icons: { primary: "ui-icon-folder-open"} });
    $("#shuffle").button();
    $("#repeat").buttonset();

    ui.wb.tabs = $("#wbs-tabs").tabs({ heightStyle: "fill" });
    ui.wb.tabs.delegate("span.ui-icon-close", "click", function () {
        var id = $(this).closest("li").remove().attr("aria-controls");
        $("#" + id).remove();
        ui.wb.tabs.tabs("refresh");
    });

    $("#send_speak").button({ text: false, icons: { primary: "ui-icon-comment"} });

    $(document).tooltip();

    ui.resize();
}

$(window).resize(ui.resize);
