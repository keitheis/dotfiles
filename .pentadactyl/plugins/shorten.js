var shortenURL = function (args) {
	let url = args[0] || buffer.URL;
	if (url == "")
		dactyl.echomsg("Please specifically a uri.", commandline.FORCE_SINGLELINE);
	let invert = options.get("shorten-yank").value;
	if (args.bang)
		invert = !invert;
	// let pattern = /(http:\\)?((is.gd\/[a-zA-Z0-9]{5})|)/gi; // the candy
	var callback = function (data) {
		if (invert)
			dactyl.clipboardWrite(data.trim(), true, options["shorten-clipboard"]);
		else
			dactyl.echomsg(data.trim(), commandline.FORCE_SINGLELINE);
	};
	let engine = options.get("shorten-engine").value;
	// TODO: unique
	if (args["-b"])
		engine = "b";
	if (args["-g"])
		engine = "g";
	if (args["-i"])
		engine = "i";
	switch (engine) {
		case 'b' :
			bitly(url, callback);
			break;
		case 'g' :
			google(url, callback);
			break;
		case 'i' :
			isgd(url, callback);
			break;
		default :
			break;
	}
};

var bitly = function (url, callback) {
	/**
	 * Reference
	 * http://code.google.com/p/bitly-api/
	 */
	if (options["shorten-user-bitly"].length == 0)
		return dactyl.echoerr("Bitly username doesn't exists!");
	if (options["shorten-key-bitly"].length == 0)
		return dactyl.echoerr("Your bitly api key doesn't exists!.");
	if (!(/^https?:\/\//.test(url)))
		url = encodeURIComponent("http://" + url); // TODO: check
	var req = new XMLHttpRequest();
	var querystring = "login="+options["shorten-user-bitly"]+"&apiKey="+options["shorten-key-bitly"]+"&format=txt&longUrl="+url;
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

var google = function (url, callback) {
	/**
	 * Reference
	 * Google URL Shortener
	 * http://goo.gl/
	 * Google APIs Console
	 * http://code.google.com/apis/console/
	 * Google URL Shortener API
	 * http://code.google.com/apis/urlshortener/index.html
	 */
	var req = new XMLHttpRequest();
	req.open("POST",
		"https://www.googleapis.com/urlshortener/v1/url",
		true
	);
	req.setRequestHeader('Content-Type', 'application/json');
	var data = {
		"longUrl" : url,
	};
	if (options["shorten-key-google"].length)
		data['key'] = options["shorten-key-google"];
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

var isgd = function (url, callback) {
	/**
	 * Reference
	 * API
	 * http://is.gd/apishorteningreference.php
	 */
	var req = new XMLHttpRequest();
	var querystring = "format=simple&url="+encodeURIComponent(url);
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
};

let opt = [];
[
	["-b","Bitly helps you share, track, and analyze your links."],
	["-g", "Google URL Shortener"],
	["-i", "is.gd - a URL shortener. Mmmm, tasty URLs!"]
].forEach(function(item) {
	let [a, d] = item;
	opt.push({
		names: [a],
		description: [d],
		type: CommandOption.NOARG
	});
});

// Add custom commands
group.commands.add(["shor[ten]", "sht"],
	"Shorten current url or specific url",
	shortenURL,
	{
		argCount: "*",
		bang: true,
		literal: 0,
		options: opt
	},
	true
);

// Add custom settings
group.options.add(["shorten-engine", "shte"],
	"Custom Shorten Engine",
	"string", "i",
	{
		completer : function (context) [
			["b","Bitly helps you share, track, and analyze your links."],
			["g", "Google URL Shortener"],
			["i", "is.gd - a URL shortener. Mmmm, tasty URLs!"]
		]
	}
);

group.options.add(["shorten-yank", "shty"],
	"Copy Shorten URL to ClipBoard",
	"boolean",
	true
);

group.options.add(["shorten-key-google", "shkg"],
	"Requests to the Google URL Shortener API for public data must be accompanied by an identifier, which can be an API key or an auth token.",
	"string",
	""
);

group.options.add(["shorten-user-bitly", "shub"],
	"Bitly username.",
	"string",
	""
);

group.options.add(["shorten-key-bitly", "shkb"],
	"Your bitly api key.",
	"string",
	""
);

group.options.add(["shorten-clipboard", "shcb"],
	"ClipBoard.",
	"string",
	"",
	{
		completer: function (context) [
			["global", "global clipboard"],
			["selection", "selection clipboard"]
		],
		validator: function (value) {
			return ["", "global", "selection"].indexOf(value) >= 0;
		}
	}
);
