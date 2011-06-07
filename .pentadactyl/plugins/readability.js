"use strict";
XML.ignoreWhitespace = false;
XML.prettyPrinting = false;
var INFO =
<plugin name="readability" version="0.1.1"
        href="https://github.com/grassofhust/dotfiles/blob/master/.pentadactyl/plugins/readability.js"
        summary="Read Comfortably—Anytime, Anywhere"
        xmlns={NS}>
    <author email="frederick.zou@gmail.com">Yang Zou</author>
    <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
    <project name="Pentadactyl" min-version="1.0"/>
    <p>
	Readability is a web &amp; mobile app that zaps online clutter and saves web articles in a comfortable reading view. No matter where you are or what device you use, your reading will be there.
	</p>
	<p>
	This plugin provide one command (<em>:read</em>) and three args ( <em>read/save/send</em>, read is the default arg, send means that Sending to your kindle.) to interact with Readability web services.
    </p>
</plugin>;


const BOOKMARKLET_READ = "javascript:((function(){window.baseUrl='https://www.readability.com';window.readabilityToken='';var s=document.createElement('script');s.setAttribute('type','text/javascript');s.setAttribute('charset','UTF-8');s.setAttribute('src',baseUrl+'/bookmarklet/read.js');document.documentElement.appendChild(s);})())";

const BOOKMARKLET_SEND = "javascript:((function(){window.baseUrl='https://www.readability.com';window.readabilityToken='';var s=document.createElement('script');s.setAttribute('type','text/javascript');s.setAttribute('charset','UTF-8');s.setAttribute('src',baseUrl+'/bookmarklet/send-to-kindle.js');document.documentElement.appendChild(s);})())";

group.commands.add(["rea[dability]", "rea"],
	"Read Comfortably—Anytime, Anywhere",
	function (args) {
		let addon = true;
		if (typeof rdb === "undefined")
			addon = false;

		let read = function (addon) {
			if (addon)
				rdb.overlay.read();
			else
				dactyl.open(BOOKMARKLET_READ, {where:dactyl.CURRENT_TAB});
		};

		let send = function (addon) {
			if (addon)
				rdb.overlay.send_to_kindle();
			else
				dactyl.open(BOOKMARKLET_SEND, {where:dactyl.CURRENT_TAB});
		};

		let save = function (addon) {
			if (addon)
				rdb.overlay.save();
			else {
				dactyl.echoerr("Missing readability Add-On", commandline.FORCE_SINGLELINE);
				dactyl.timeout(function () {dactyl.open('https://www.readability.com/addons', {background:false, where:dactyl.NEW_TAB});}, 1000);
			}
		};

		if (args.length == 0) {
			read();
		} else {
			switch (args[0]) {
				case 'read':
				read();
				break;
				case 'save':
				save();
				break;
				case 'send':
				send();
				break;

				default:
				dactyl.echo("Undefined Option!", commandline.FORCE_SINGLELINE);
				break;
			}
		}
		return true;
	},
	{
		argCount: "?",
		bang: true, // TODO
		completer: function (context, args) {
			switch (args.completeArg) {
				case 0:
				context.completions = [
					["read", "Read Now"],
					["save", "Read Later"],
					["send", "Send to Kindle"]
				];
				break;

				default:
				break;
			}
		}
	}
);

