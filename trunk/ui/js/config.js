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