// repeat.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Sat 06 Aug 2011 03:31:12 PM CST
// @Last Change: Mon 08 Aug 2011 02:43:22 AM CST
// @Revision:    304
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

let repeat = {
	get repeatingPanels() {
		let panels = prefs.get("pentadactyl.plugins.repeat.repeatingPanels");
		if (panels) {
			let aPanel = JSON.parse(panels);
			if (Array.isArray(aPanel))
				return aPanel;
			return [];
		} else
			return [];
	},
	set repeatingPanels(panels) {
		let sPanel = JSON.stringify(panels);
		prefs.set("pentadactyl.plugins.repeat.repeatingPanels", sPanel, true);
	},

	removePanel: function(/*aPanel*/) {
		let _aPanel = arguments[0] || false;
		let linkedPanel = _aPanel[0] || repeat.linkedPanel(tab);
		let panels = repeat.repeatingPanels;

		repeat.repeatingPanels = panels.filter(function(aPanel) {
			if (aPanel[0] == linkedPanel)
				return false;
			return true;
		});
	},

	addPanel: function(aPanel) {
		let panels = repeat.repeatingPanels;
		panels.push(aPanel);
		repeat.repeatingPanels = panels;
	},

	getPanel: function(/*aTab*/) {
		let tab = arguments[0] || gBrowser.mCurrentTab;
		let linkedPanel = repeat.linkedPanel(tab);
		let panels = repeat.repeatingPanels;

		for (let [i, aPanel] in Iterator(panels)) {
			if (aPanel[0] == linkedPanel)
				return aPanel;
		}

		return null;
	},

	linkedPanel: function(/*aTab*/) {
		let tab = arguments[0] || gBrowser.mCurrentTab;
		return tab.linkedPanel;
	},
	linkedTab: function(/*alinkedPanel*/) {
		if (typeof arguments[0] !== "undefined") {
			Array.slice(gBrowser.tabs).forEach(function (aTab) {
				if (aTab.linkedPanel == arguments[0])
					return aTab;
			})
			return false; // linkedPanel was provided, but we don't find the associated tab
		}
		
		return gBrowser.mCurrentTab;
	},

	linkedBrowser: function(/*aTab*/) {
		return (arguments[0] && arguments[0].linkedBrowser) || gBrowser.mCurrentBrowser;
	},

	clearRepeating: function(/*aTab*/) {
		let tab = arguments[0] || gBrowser.mCurrentTab;
		let panel = repeat.getPanel(tab);
		if (panel) {
			window.clearInterval(panel[1]);
			repeat.removePanel(panel);
			panel = null;
			dactyl.echo("已移除给定标签中的定时任务!");
		} else {
			dactyl.echoerr("给定标签页中无定时任务!");
		}
	},

	init: function(args) {
		if (args["-l"])
			return repeat.listRepeatings();
		let interval = (parseInt(args["-i"], 10) || options["repeat-interval"] || options.get("repeat-interval").defaultValue) * 1000; // unit: seconds

		let force = args["-f"] || false;
		if (!force && interval <= 3000) {
			dactyl.echoerr("时间间隔过低,请加上 -f 参数来强制执行!");
			return false;
		} else {
			let action = args[0] || "r" // reload by default

			let linkedPanel = repeat.linkedPanel();
			let panel = repeat.getPanel();
			let browser = repeat.linkedBrowser();

			if (args.bang) {
				let tab = gBrowser.mCurrentTab;
				if (args[0]) {
					let buffer = args[0];
					let matches = buffer.match(/^(\d+):?/);
					if (matches)
						tab = gBrowser.tabs[parseInt(matches[1], 10) -1];
				}
				repeat.clearRepeating(tab);
			} else {
				if (panel) { // already in, now we remove it
					window.clearInterval(panel[1]);
					repeat.removePanel(panel);
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
				repeat.addPanel([linkedPanel, intervalId, interval]);
				dactyl.echo("定时任务已添加!");
			}
	}
	},

	tips: function(args, message) {
		let interval = parseInt(args["-i"], 10) || options["repeat-interval"] || options.get("repeat-inter").defaultValue;
		// let action = dactyl.generateHelp(commands.get(addons), <p>Extra text</p>);
	},

	humanTime: function(interval) {
	},

	execute: function(act, browser) {
		if (act=="r")
			browser.reload();
		else
			events.feedkeys(act, false, false, modes.NORMAL);
	},

	generate: function(context, args) {
		if (repeat.repeatingPanels.length>0) {
			let activeTabs = Array.slice(gBrowser.tabs).filter(function(aTab) {
					let panel = repeat.getPanel(aTab);
					if (panel)
						return true;
					return false;
			});
		}
	},

	clean: function() {
		let panels = repeat.repeatingPanels;
		let validPanels = panels.filter(function (aPanel) {
			if (Array.slice(gBrowser.tabs).some(function(aTab) {
				if (aTab.linkedPanel == aPanel[0])
					return true;
				return false;
			})) {
				return true;
			}
			return false;
		});
		repeat.repeatingPanels = validPanels;
	},

	listRepeatings: function() { // TODO: command
		if (repeat.repeatingPanels.length>0) {
			let activeTabs = Array.slice(gBrowser.tabs).filter(function(aTab) {
					let panel = repeat.getPanel(aTab);
					if (panel)
						return true;
					return false;
			});
			let l = <></>;
			activeTabs.forEach(function(aTab) {
					let _l = <><tr><td><img src={aTab.image || DEFAULT_FAVICON}/></td><td>{gBrowser.tabContainer.getIndexOfItem(aTab)+1}</td><td>{aTab.label}</td></tr></>;
				l+=_l;
			})
			dactyl.echo(<table>
				<thead><tr><th></th><th>序号</th><th>标题</th></tr></thead>
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
			commandline.input("设置的时间间隔太小, 你确定要继续吗? (y/n) : ", function(choose) { // TODO: has no affect
				if (choose!="y" || choose!="Y")
					answer = false;
			});
		}
		return answer;
	}
};

options.add(["repeat-interval", "repint"], // TODO 提示不要设置得太小,　要不然会有性能问题
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
					return repeat.repeatingPanels.some(function(aPanel) {
						if (item.item.tab.linkedPanel == aPanel[0])
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
				description: "执行情形, 如果此选项为空, 则包括所有!",
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

if (mappings.get(modes.NORMAL, "<Leader>rr"))
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

repeat.clean();


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
