// repeat.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Sat 06 Aug 2011 03:31:12 PM CST
// @Last Change: Thu 09 Feb 2012 08:32:56 PM CST
// @Revision:    423
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

let repeat = {
	store: storage.newMap("repeat_js", {store: false}),
	linkedPanel: function(/*aTab*/) {
		let tab = arguments[0] || gBrowser.mCurrentTab;
		return tab.linkedPanel;
	},
	linkedTab: function(/*alinkedPanel*/) {
		let tab = gBrowser.mCurrentTab;
		if (typeof arguments[0] !== "undefined") {
			let linkedPanel = arguments[0];
			Array.forEach(gBrowser.tabs, function (aTab) {
				if (aTab.linkedPanel == linkedPanel)
					tab = aTab;
			})
		}
		return tab;
	},

	linkedBrowser: function(/*aTab*/) {
		return (arguments[0] && arguments[0].linkedBrowser) || gBrowser.mCurrentBrowser;
	},

	info: function(/*aTab*/) {
		let aTab = arguments[0] || gBrowser.mCurrentTab;
		return "标签: " + (gBrowser.tabContainer.getIndexOfItem(aTab) + 1) + " - " + aTab.label;
	},

	clearRepeating: function(/*aBuffer*/) {
		let tab = gBrowser.mCurrentTab;
		let buffer = arguments[0] || false;
		if (buffer) {
			let matches = buffer.match(/^(\d+):?/);
			if (matches)
				tab = gBrowser.tabs[parseInt(matches[1], 10) -1];
		} else {
			if (repeat.store.keys().length == 1)
				tab = repeat.linkedTab(repeat.store.keys()[0]);
			else {
				if (repeat.store.keys().length == 0)
					dactyl.echoerr("无活动定时任务");
				else
					dactyl.echoerr("有多个活动任务且当前标签页无活动任务, 请指定要移除的活动任务!");
				return false;
			}
		}
		let panel = repeat.store.get(tab.linkedPanel);
		if (panel) {
			window.clearInterval(panel[0]);
			repeat.store.remove(tab.linkedPanel);
			dactyl.echo("已移除给定标签中的定时任务! " + repeat.info(tab));
			panel = null;
		} else {
			dactyl.echoerr("给定标签页中无定时任务!");
		}
	},

	init: function(args) {
		if (args["-l"])
			return repeat.listRepeatings();

		let interval = (parseInt(args["-i"], 10) || options["repeat-interval"] || options.get("repeat-interval").defaultValue) * 1000; // unit: seconds
		let count = parseInt(args.count, 10);
		if (count > 0)
			interval = count * 1000;

		let force = args["-f"] || false;
		if (!force && interval <= 3000) {
			dactyl.echoerr("时间间隔过低,请加上 -f 参数来强制执行!");
			return false;
		} else {
			let action = args[0] || "r" // reload by default

			let linkedPanel = repeat.linkedPanel();
			let panel = repeat.store.get(linkedPanel);
			let browser = repeat.linkedBrowser();

			if (args.bang) {
					repeat.clearRepeating(args[0] || "");
			} else {
				if (panel) { // already in, now we remove it
					window.clearInterval(panel[0]);
					repeat.store.remove(linkedPanel);
				}

				let intervalId = window.setInterval(function() {
						let state = args["-b"] || "";
						switch ( state ) {
							case "background" :
							if (linkedPanel != repeat.linkedPanel())
								repeat.execute(action, browser);
							break;

							case "foreground" :
							if (linkedPanel == repeat.linkedPanel())
								repeat.execute(action, browser);
							break;

							default :
							repeat.execute(action, browser);
							break;
						}
					},
					interval
				);
				repeat.store.set(linkedPanel, [intervalId, interval]);
				dactyl.echo("定时任务已添加! " + repeat.info() + " 时间间隔: " + repeat.humanTime(interval));
			}
	}
	},

	tips: function(args, message) {
		let interval = parseInt(args["-i"], 10) || options["repeat-interval"] || options.get("repeat-inter").defaultValue;
		// let action = dactyl.generateHelp(commands.get(addons), <p>Extra text</p>);
	},

	humanTime: function(interval) {
		let m = interval;
		let days = Math.floor(m / (24*60*60*1000));
		m = m % (24*60*60*1000);
		let hours = Math.floor(m / (60*60*1000));
		m = m % (60*60*1000);
		let minutes = Math.floor(m / (60*1000));
		m = m % (60*1000);
		let seconds = Math.floor(m / 1000);
		m = m % 1000;
		let readable = "";
		if (days)
			readable += days + "天";
		if (hours)
			readable += hours + "小时";
		if (minutes)
			readable += minutes + "分钟";
		if (seconds)
			readable += seconds + "秒";
		if (m)
			readable += m + "毫秒";
		return readable;
	},

	execute: function(act, browser) {
		if (act=="r")
			browser.reload();
		else
			events.feedkeys(act, false, false, modes.NORMAL);
	},

	generate: function(context, args) {
		if (repeat.store.keys().length) {
			let activeTabs = Array.filter(gBrowser.tabs, function(aTab) {
					let panel = repeat.store.get(aTab.linkedPanel);
					if (panel)
						return true;
					return false;
			});
		}
	},

	listRepeatings: function() { // TODO: command
		if (repeat.store.keys().length) {
			let l = <></>;
			Array.forEach(gBrowser.tabs, function(aTab) {
					let panel = repeat.store.get(aTab.linkedPanel);
					if (panel) {
						let _l = <><tr style="text-align:center;"><td>{gBrowser.tabContainer.getIndexOfItem(aTab)+1}</td><td style="vertical-align:middle;"><img style="vertical-align:middle;margin-right:5px;" src={aTab.image || DEFAULT_FAVICON}/>{aTab.label}</td><td>{repeat.humanTime(panel[1])}</td></tr></>;
						l+=_l;
					}
			});
			dactyl.echo(<table style="border-spacing:8px 4px;border-collape: separate;">
				<thead><tr><th>Tab ID</th><th>标题</th><th>时间间隔</th></tr></thead>
				<tbody>{l}</tbody>
				</table>
			);
		} else
			dactyl.echo("无活动定时任务!");

		return true;
	},
	/**
	 * 比较前后两次执行时的内容差别
	 *
	 * @param {object} browser 标签页中的浏览器对象
	 * @param {string} xpath xpath/css selector
	 * @param {string} prev 上一次的内容
	 * @returns {boolean}
	 */
	diff: function(browser, xpath, prev) {

	},

	confirm: function(interval) {
		let answer = true;
		if (interval <=3000) {
			commandline.input("设置的时间间隔太小, 你确定要继续吗? (y/n) : ", function(choose) { // TODO: has no effect
				if (choose!="y" || choose!="Y")
					answer = false;
			});
		}
		return answer;
	}
};

group.options.add(["repeat-interval", "repint"], // TODO 提示不要设置得太小,　要不然会有性能问题
	"Repeat Interval",
	"number",
	30,
	{
		validator: function(value) {
			let interval = value*1000;
			if (interval > 3000)
				return true;
			else
				dactyl.echo("时间间隔太低, 拒绝更改");
				return false;
		}
	}
);

group.commands.add(["rep[eat]", "rep"],
	"Repeat actions!",
	repeat.init,
	{
		bang: true,
		argCount: "?",ount: "?",
		completer: function(context, args) {
			if (args.bang) {
				context.filters.push(function(item) {
						return Array.some(repeat.store.keys(), function(linkedPanel) {
						if (item.item.tab.linkedPanel == linkedPanel)
							return true;
						return false;
					})
				});
				completion.buffer(context);
			}
		},
		count: true,
		options: [
			{
				names: ["-i"],
				description: "时间间隔, 默认为 "+options.get("repeat-interval").defaultValue+" 秒",
				type: CommandOption.INT
			},
			{
				names: ["-b"],
				description: "执行场合, 如果此选项为空, 则两种场合均包含!",
				type: CommandOption.STRING,
				completer: function(context, arg) [
					["background", "后台执行"],
					["foreground", "前台执行"],
				]
			},
			{
				names: ["-l"],
				description: "列出运行中的任务标签!",
				type: CommandOption.NOARG
				// completer: completion.buffer
			},
			{
				names: ["-f"],
				description: "强制使用该时间间隔!",
				type: CommandOption.NOARG
			}
		]
	},
	true
);

if (mappings.get(modes.NORMAL, "<Leader>rr")) // TODO
	dactyl.echoerr("<Leader>rr 已被绑定");
else {
	group.mappings.add(
		[modes.NORMAL],
		["<Leader>rr"],
		"快速移除当前标签下的活动任务!",
		function (args) repeat.clearRepeating,
		{}
	);
}

/**
 * 移除当前所有正在运行的任务
 */
function onUnload() { // :rehash, exit firefox/current window, disable pentadactyl extension
	Array.forEach(repeat.store.keys(), function (linkedPanel) {
		let panel = repeat.store.get(linkedPanel);
		window.clearInterval(panel[0]);
	});

	repeat.store.clear();
}


// 默认无限循环
// -i[nterval]　执行间隔,　默认为 30 seconds 
// -c[ount] 执行的次数, 0为无数次
// -m[ode] 模式, 默认为普通模式
// -b[ookmark] 添加为书签, 快捷调用
// -u 更新现有的, 替换掉
// -b[ackground] 只在后台运行
// -l[ist] 列出所有运行中的
// session support?
// specific event listener for loadplugins/rehash/source/restart
// 检查内容是否发生改变
// use storage to replace preferences
// use onUnload

