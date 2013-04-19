var ui = {
    wb: {
        tabs: null,
        counter: 1,
        tpl: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>"
    },
    usr: {
        tpl: '<div class="ui-widget-content ui-corner-all"><h3 class="ui-widget-header ui-corner-all">#{name}</h3><center><video width="320" height="240"></video></center></div>'
    }
};

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
    var h = window.innerHeight - $('#tb-ct').height() - 20;
    $('#wbs-ct').height(h);
    ui.wb.tabs.tabs("refresh");
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

    $(document).tooltip();

    ui.resize();
}

$(window).resize(ui.resize);
