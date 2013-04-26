var vdir = '/';
(function(){
	var ss = location.pathname.split('/');
	ss[ss.length - 1] = '';
	vdir = ss.join('/');
})();

var root_uri = location.protocol + '//' + location.host + '/';
var site_uri = location.protocol + '//' + location.host + vdir;

function root_url(res){
	if (res) return (root_uri + res);
	else return root_uri;
}
function site_url(res) {
	if (res) return (site_uri + res);
	else return site_uri;
}

function apply(a, b) {
    if (b != null) {
        a = a || {};
        for (var k in b) {
            a[k] = b[k];
        }
    }
    return a;
}

function applyIf(a, b) {
    if (b != null) {
        a = a || {};
        for (var k in b) {
            if (a[k] == undefined)
                a[k] = b[k];
        }
    }
    return a;
}

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

var request = [];
(function(){
    var s = location.search.substr(1);
    if (s) {
	    var ss = s.split('&');
	    for(var i=0; i<ss.length; i++) {
		    var p = ss[i].split('=');
		    request[p[0]] = p[1];
	    }
    }
})();

function logError(e) {
    console.log(e);
}