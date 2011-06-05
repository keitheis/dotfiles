// readability.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Sun 05 Jun 2011 07:22:35 PM CST
// @Last Change: Sun 05 Jun 2011 07:55:25 PM CST
// @Revision:    15
// @Description:
// @Usage:
// @TODO:
// @CHANGES:


group.commands.add(["rea[dability]", "rea"],
	"Read Comfortably—Anytime, Anywhere",
	function (args) {
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

