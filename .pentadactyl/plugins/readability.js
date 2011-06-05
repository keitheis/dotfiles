// readability.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Sun 05 Jun 2011 07:22:35 PM CST
// @Last Change: Sun 05 Jun 2011 08:13:09 PM CST
// @Revision:    17
// @Description:
// @Usage:
// @TODO:
// @CHANGES:


group.commands.add(["rea[dability]", "rea"],
	"Read Comfortably—Anytime, Anywhere",
	function (args) {
		if (typeof rdb === "undefined") {
			dactyl.echoerr("Missing readability Add-On", commandline.FORCE_SINGLELINE);
			dactyl.timeout(function () {dactyl.open('https://www.readability.com/addons', {background:false, where:dactyl.NEW_TAB});}, 1000);
		}
		if (args.length == 0) {
			rdb.overlay.read();
		} else {
			switch (args[0]) {
				case 'read':
				rdb.overlay.read();
				break;
				case 'save':
				rdb.overlay.save();
				break;
				case 'send':
				rdb.overlay.send_to_kindle();
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

