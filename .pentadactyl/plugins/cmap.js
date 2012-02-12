// cmap.js -- command map, <C-Return>, <S-Return>, <A-Return>, etc
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Mon 27 Jun 2011 09:59:53 PM CST
// @Last Change: Sun 12 Feb 2012 09:59:34 PM CST
// @Revision:    143
// @Description:
// @Usage:
// @TODO:
// @CHANGES:
// 在 caret 模式下输入命令之后，光标会丢失？
[
	[[modes.EX], ["S"], "Toggle !, or specific feature for open/tabopen/winopen"],
	[[modes.EX], ["C"], "Force new tab."],
	[[modes.EX], ["A"], "Force background tab."]
].forEach(function (args) {
	let [mode, keys, description] = args;
	group.mappings.add(mode, keys.map(function(key) '<'+key+'-Return>'), description, function () {
		let command = commandline.command;
		commands.repeat = command; // TODO: more work
		return function () {
			modes.pop();
			execute(command, keys);
		};
	});
});

function execute(str, keys, modifiers, silent) {
    // skip comments and blank lines
    if (/^\s*("|$)/.test(str))
        return;

    modifiers = modifiers || {};

    if (!silent)
        commands.lastCommand = str.replace(/^\s*:\s*/, "");
    let res = true;
    for (let [command, args] in commands.parseCommands(str.replace(/^'(.*)'$/, "$1"))) {
        if (command === null)
            throw FailedAssertion(_("dactyl.notCommand", config.appName, args.commandString));

		if (keys.toSource() == ["S"].toSource()){
			switch (command.name) {
				case "open" :
				case "tabopen" :
				case "winopen" :
				if (args[0]) {
					var urls = args[0].split(/\s+\|\s+/).map(function (str) {
							return str.replace(/^(?:www\.)?(.+?)(?:\.com)?$/g , "$1.com");
					});
					var seps = args[0].match(/\s+\|\s+/g) || [];
					seps.push("");
					var serializes = [];
					for (let [idx, elem] in Iterator(urls)) {
						serializes.push(elem);
						serializes.push(seps[idx]);
					}
					args[0] = serializes.join("");
				}
				break;

				default :
				// if command has bang option
				if (command.bang)
					args.bang = !args.bang;
				break;
			}
		} else if (keys.toSource() == ["C"].toSource()) {
			switch (command.name) {
				case "tab" :
				break;

				default :
				var params = [command.name];
				params = params.concat(Array.slice(args));
				args[0] = params.join(" ");
				command = commands.get("tab");
				break;
			}
		} else if (keys.toSource() == ["A"].toSource()) {
			switch (command.name) {
				case "background" :
				break;

				default :
				var params = [command.name];
				params = ["tab"].concat(params).concat(Array.slice(args));
				args[0] = params.join(" ");
				command = commands.get("background");
				break;
			}
		}
        res = res && command.execute(args, modifiers);
    }
    return res;
}

// <C-Return> 在新标签页中打开
// <S-Return> 反转 args.bang，如果是针对 open/tabopen/winopen 命令，则是地址替换，比如把 baidu 自动替换为 baidu.com
// <A-Return> 以后台方式在新标签页中打开
