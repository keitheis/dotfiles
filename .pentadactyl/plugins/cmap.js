// cmap.js -- command map, <C-Return>, <S-Return>, <A-Return>, etc
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Mon 27 Jun 2011 09:59:53 PM CST
// @Last Change: Wed 07 Mar 2012 06:15:43 PM CST
// @Revision:    237
// @Description: <C-Return> 在新标签页中打开
//               <S-Return> 反转 args.bang，如果是针对 open/tabopen/winopen 命令，
//               则是地址替换，比如把 baidu 自动替换为 baidu.com
//               <A-Return> 以后台方式在新标签页中打开
// @Usage:
// @CHANGES:
// @TODO:        在 caret 模式下输入命令之后，光标会丢失？
[
	[[modes.EX], ['S'], 'Toggle !, or specific feature for open/tabopen/winopen'],
	[[modes.EX], ['C'], 'Force new tab.'],
	[[modes.EX], ['A'], 'Force background tab.']
].forEach(function (args) {
	let [mode, keys, description] = args;
	group.mappings.add(mode, keys.map(function(key) '<'+key+'-Return>'), description, function () {
		let command = commandline.command;
		commands.repeat = command; // TODO: more work
		modes.pop();
		execute(command, keys);
	});
});

function execute(str, keys, modifiers, silent) {
	// skip comments and blank lines
	if (/^\s*("|$)/.test(str))
		return;

	modifiers = modifiers || {};

	if (!silent)
		commands.lastCommand = str.replace(/^\s*:\s*/, '');

	for (let [command, args] in commands.parseCommands(str.replace(/^'(.*)'$/, '$1'))) {
		if (command === null)
			throw FailedAssertion(_('dactyl.notCommand', config.appName, args.commandString));

		let name = command.name;
		let _args = {};
		if (keys.toSource() == ['S'].toSource()) {
			switch (name) {
				case 'open' :
				case 'tabopen' :
				case 'winopen' :
				if (args[0]) {
					var urls = args[0].split(/\s+\|\s+/).map(function (str) {
							return str.replace(/^(?:www\.)?(.+?)(?:\.com)?$/g , '$1.com');
					});
					var seps = args[0].match(/\s+\|\s+/g) || [];
					seps.push('');
					var serializes = [];
					for (let [idx, elem] in Iterator(urls)) {
						serializes.push(elem);
						serializes.push(seps[idx]);
					}
					args[0] = serializes.join('');
				}
				break;

				default :
				// if command has bang option
				if (command.bang)
					args.bang = !args.bang;
				break;
			}
			_args = args
		} else if (keys.toSource() == ['C'].toSource()) {
			if (name == 'tab')
				_args = args;
			else {
				command = commands.get('tab');
				_args = command.newArgs({0: args.commandString});
			}
		} else if (keys.toSource() == ['A'].toSource()) {
			if (name == 'background')
				_args = args;
			else {
				command = commands.get('background');
				_args = command.newArgs({0: 'tab ' + args.commandString});
			}
		}
		command.execute(_args, modifiers);
	}
}
