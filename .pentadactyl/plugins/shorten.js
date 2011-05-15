var shortenURL = function (args) {
	if (typeof args[0] == "undefined" || args[0].length==0) {
		var url = encodeURI(buffer.URL);
	} else {
		var url = encodeURI(args[0]);
	}

	if (!url || url.length == 0) {
		dactyl.echo('Empty String');
		return -1;
	}
	var req = new XMLHttpRequest();
	// url = encodeURIComponent(url);
	var callback = function (data) {
		dactyl.echo(data);
		if (!args.bang) {
			dactyl.clipboardWrite(data, true);
		}
	};
	switch ( options.get("shorten-engine").value ) {
		case 'bitly' :
			bitly(req, url, callback);
			break;
		case 'google' :
			google(req, url, callback);
			break;
		case 'isgd' :
			isgd(req, url, callback);
			break;
		default :
			break;
	}
};

var bitly = function (req, url, callback) {
	/**
	 * Reference
	 * http://code.google.com/p/bitly-api/
	 */
	var querystring = "login=grassofhust&apiKey=R_696fd603075a1cedeb0fd56bbaa58033&format=txt&longUrl="+url;
	req.open("GET",
		"http://api.bit.ly/v3/shorten?" + querystring,
		true
	);
	req.onreadystatechange = function (ev) {
		if (req.readyState == 4) {
			if (req.status == 200) {
				callback(req.responseText);
			} else {
				callback(req.responseText);
			}
		}
	};
	req.send(null);
};

var google = function (req, url, callback) {
	/**
	 * Reference
	 * Google URL Shortener
	 * http://goo.gl/
	 * Google APIs Console
	 * http://code.google.com/apis/console/
	 * Google URL Shortener API
	 * http://code.google.com/apis/urlshortener/index.html
	 */
	req.open("POST",
		"https://www.googleapis.com/urlshortener/v1/url",
		true
	);
	req.setRequestHeader('Content-Type', 'application/json');
	var data = {
		"longUrl" : url,
		"key" : "AIzaSyDaUYAFnNQB3X4__ZuwcPfc8nGNwhItDPk"
	};
	req.send(JSON.stringify(data));
	req.onreadystatechange = function (ev) {
		if (req.readyState == 4) {
			if (req.status == 200) {
				var result = JSON.parse(req.responseText);
				callback(result.id);
			} else {
				callback(req.status);
			}
		}
	};
};

var isgd = function (req, url, callback) {
	/**
	 * Reference
	 * API
	 * http://is.gd/apishorteningreference.php
	 */
	var querystring = "format=simple&url="+url;
	req.open("GET",
		"http://is.gd/create.php?" + querystring,
		true
	);
	req.onreadystatechange = function (ev) {
		if (req.readyState == 4) {
			if (req.status == 200) {
				callback(req.responseText);
			} else {
				callback(req.responseText);
			}
		}
	};
	req.send(null);
}

// Add custom commands
group.commands.add(["shor[ten]", "sht"],
	"Shorten current url or specific url",
	shortenURL,
	{
		argCount: "?",
		bang: true
	}
);

// Add custom settings
options.add(["shorten-engine", "shte"],
	"Custom Shorten Engine",
	"string", "bitly",
	{
		completer : function (context) [
			["bitly","Bitly helps you share, track, and analyze your links."],
			["google", "Google URL Shortener"],
			["isgd", "is.gd - a URL shortener. Mmmm, tasty URLs!"]
		]
	}
);


/*
" command -nargs=0 shorten :execute "!shorten " + encodeURI(content.location.href)
command! -nargs=? bitly javascript shortenURLBitLy(<q-args>)
" map <silent> gy :javascript shortenURLBitLy(buffer.URL);<CR>

*/
