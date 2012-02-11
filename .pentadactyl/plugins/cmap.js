// cmap.js -- command map, <C-Return>, <S-Return>, <A-Return>, etc
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Mon 27 Jun 2011 09:59:53 PM CST
// @Last Change: Sat 11 Feb 2012 10:39:52 PM CST
// @Revision:    117
// @Description:
// @Usage:
// @TODO:
// @CHANGES:
// 在 caret 模式下输入命令之后，光标会丢失？

group.mappings.add([modes.EX], ["<S-Return>"], "Toggle !, or specific feature for open/tabopen/winopen", function () {
        let command = commandline.command;
        commands.repeat = command; // TODO: more work
        return function () {
            modes.pop();
            execute(command);
        };
});

function execute(str, modifiers, silent) {
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
            // if command support bang option
            if (command.bang)
                args.bang = !args.bang;
            break;
        }
        res = res && command.execute(args, modifiers);
    }
    return res;
}

group.mappings.add([modes.EX], ["<C-Return>"], "Force new tab.", function () {
        let command = commandline.command;
        commands.repeat = command;
        return function () {
            modes.pop();
            tab(command);
        };
});

function tab(str, modifiers, silent) {
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
        res = res && command.execute(args, modifiers);
    }
    return res;
}
