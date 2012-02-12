// dactyl.assert(!("LOADED_EDIT_JS" in userContext), (new Error).fileName + " has already been loaded!");
// userContext.LOADED_EDIT_JS = true;
// "use strict";
XML.ignoreWhitespace = XML.prettyPrinting = false;

var PATH_SEP = File.PATH_SEP;
var localFile = Components.classes["@mozilla.org/file/local;1"]
	.createInstance(Components.interfaces.nsILocalFile);

let edit = {
	get RC() edit._RC || edit._setRC(),
	_setRC: function () {
		// stolen from content/dactyl.js
		let init = services.environment.get(config.idName + "_INIT");
		let rcFile = io.getRCFile("~");

		try {
			if (dactyl.commandLineOptions.rcFile) {
				let filename = dactyl.commandLineOptions.rcFile;
				if (!/^(NONE|NORC)$/.test(filename)) {
					edit._RC = io.File(filename).path;
					return edit._RC;
				}
			} else {
				if (init)
					; // do nth
				else {
					if (rcFile) {
						edit._RC =  rcFile.path;
						return edit._RC;
					}
				}

				if (options["exrc"] && !dactyl.commandLineOptions.rcFile) {
					let localRCFile = io.getRCFile(io.cwd);
					if (localRCFile && !localRCFile.equals(rcFile)) {
						edit._RC = localRCFile.path;
						return edit._RC;
					}
				}
			}
		} finally {
			; // do nth
		}
		let rc_name = ".pentadactylrc";
		if (config.OS.isWindows)
			rc_name = "_pentadactylrc";
		edit._RC = services.directory.get("Home", Ci.nsIFile).path + File.PATH_SEP + rc_name;
		return edit._RC;
	},
	get FileCpts() edit._FileCpts || edit._setFileCpts(),
	_setFileCpts : function () {
		edit._FileCpts = [
			['RC', 'rc file', edit.RC],
			['PrefF', 'PrefF', services.directory.get("PrefF", Ci.nsIFile).path]
		];
		return edit._FileCpts;
	},
	get DirCpts() edit._DirCpts || edit._setDirCpts(),
	_setDirCpts: function() {
		edit._DirCpts = 
		[
			['ProfD',			'profile directory'],
			['DefProfRt',		'user (for example /root/.mozilla)'],
			['UChrm',			'%profile%/chrome'],
			['DefRt',			'%installation%/defaults'],
			['PrfDef',			'%installation%/defaults/pref'],
			['ProfDefNoLoc',	'%installation%/defaults/profile'],
			['APlugns',			'%installation%/plugins'],
			['AChrom',			'%installation%/chrome'],
			// ['ComsD',			'%installation%/components'],
			['CurProcD',		'installation (usually)'],
			['Home',			'OS root (for example /root)'],
			['TmpD',			'OS tmp (for example /tmp)'],
			['ProfLD',			'Local Settings on windows; where the network cache and fastload files are stored'],
			['Desk',			'Desktop directory (for example ~/Desktop on Linux, C:\\Documents and Settings\\username\\Desktop on Windows)'],
			// ['Progs',			'User start menu programs directory (for example C:\\Documents and Settings\\username\\Start Menu\\Programs)']
	].map(function (item) {
			let [path, description] = item;
			return [path, description, services.directory.get(path, Ci.nsIFile).path];
	}).concat([
			['~', 'user home', File.expandPath('~')],
			['RUNTIMEPATH', "runtimepath", ":help 'runtimepath'"],
			['SCRIPTNAMES', ':scriptnames', ":help :scriptnames"]
	]);
		return edit._DirCpts;
	},
	isAbsolutePath: function(path) {
		let absolute_pattern = /^(~\/?|\/|~[^\/]+\/)/;
		if (config.OS.isWindows)
			absolute_pattern = /^[a-zA-Z]:[\/\\]|~/;
		return absolute_pattern.test(path);
	},
	get files() {
		let locations = [];
		options["open-files"].forEach(function (file) {
			if (file === "RC") {
				let rcfile = new File(edit.RC);
				locations.push({
					text: edit.RC,
					description: "RC - " + rcfile.path,
					file: rcfile
				});
			} else {
				let ENV = file.split(/\\|\//)[0] || file;
				if (ENV === "RUNTIMEPATH") {
					io.getRuntimeDirectories("").forEach(function(item) {
						let innerpath = item.path + file.slice(ENV.length);
						let innerfile = new File(innerpath);
						locations.push({
							text: innerpath,
							description: file + " - " + innerpath,
							file: innerfile
						});
					});
				} else {
					try {
						let partdir = services.directory.get(ENV, Ci.nsIFile);
						let fullfile = new File(partdir.path + file.slice(ENV.length));
						locations.push({
							text: fullfile.path,
							description: file + " - " + fullfile.path,
							file: fullfile,
						});
					} catch (e) {
						locations.push({
							text: file,
							description: file,
							file: false
						});
					}
				}
			}
		});
		return locations;
	},
	get dirs() {
		let locations = [];
		options["open-dirs"].forEach(function (dir) {
			// :scriptnames
			if (dir === "SCRIPTNAMES") {
				return false;
			}

			try {
				let file = localFile.initWithPath(dir);
				locations.push({
					text: file.path,
					description: file.leafName,
					file: file
				});
			} catch (e) {
				let ENV = dir.split(/\\|\//)[0] || dir;

				if (ENV === "RUNTIMEPATH") {
					io.getRuntimeDirectories("").forEach(function(item) {
						let innerpath = item.path + dir.slice(ENV.length);
						let innerfile = new File(innerpath);
						locations.push({
							text: innerfile.path,
							description: dir + " - " + innerfile.path,
							file: innerfile
						});
					});
				} else {
					try {
						let partdir = services.directory.get(ENV, Ci.nsIFile);
						let fulldir = new File(partdir.path + dir.slice(ENV.length));
						locations.push({
							text: fulldir.path,
							description: dir,
							file: fulldir
						});
					} catch (e) {
						locations.push({
							text: dir,
							description: dir,
							file: false
						});
					}
				}
			}
		});
		return locations;
	},
};

function cpt(context, args) {
	// let dirs = edit.dirs;
	// let places = edit.files.concat(dirs);
	let arg = args[0] || "";
	let dirs = edit.dirs;
	let files = edit.files;

	[files, dirs].forEach(function (locations, idx) {
		let context_name = "open-files";
		if (idx == 1)
			context_name = "open-dirs";
		context.fork(context_name, 0, this, function(context) {
			context.title = ["Files", "Description"];
			context.keys = {
				text: "text",
				description: "description",
				icon: function (item) {
					if (item.file && item.file.exists()) {
						if (item.file.isDirectory())
							return "resource://gre/res/html/folder.png";
						else
							return "moz-icon://" + item.file.path;
					}
					return "moz-icon://" + item.text;
				},
				path: function (item) item.file.path || item.text,
				exists: function (item) item.file && item.file.exists()
			};
			if (idx == 0)
				context.keys.text = function (item) item.file ? item.file.leafName : item.text;
			let p1 = context.process[1];
			context.process[1] = function (item, text) {
				if (item.exists)
					return p1(item, text);
				else
					return <><del>{text}</del></>;
			};
			context.completions = locations;
			context.compare = null;
			if (idx == 1) {
				context.filters = [function (item) {
						return item.text.toLowerCase().indexOf(context.filter.toLowerCase()) + 1 ||
							   item.description.toLowerCase().indexOf(context.filter.toLowerCase()) + 1;
				}];
				context.title[0] = "Dirs";
			} else {
				context.filters = [function (item) {
					return item.text.toLowerCase().indexOf(context.filter.toLowerCase()) + 1;
				}]
			}
		});
	});
	if (edit.isAbsolutePath(arg)) {
		let dir = {path:arg, description:"Absolute Path"};
		context.fork(dir.path, 0, this, function (context) {
				completion.file(context, false, dir.path);
				context.title[0] = arg.match(/^(?:.*[\/\\])?/)[0];
				context.filters[0] = function (item) {
					return item.text.toLowerCase().indexOf(context.filter.toLowerCase()) + 1;
				};
		});
	} else {
		if (options["open-dirs"].indexOf("SCRIPTNAMES") + 1) {
			context.fork("scriptnames", 0, this, function (context) {
				context.title= ["scriptnames", "path"];
				let completions = [];
				context.compare = null;
				Object.keys(io._scriptNames).forEach(function(filename) {
						completions.push({filename:filename, basename:(new File(filename)).leafName});
				});
				context.completions = completions;
				context.keys = {
					text: 'basename',
					description:'filename',
					path: 'filename',
					icon: function (item) "moz-icon://" + item.filename
				};
				context.filters = [function (item) {
					return item.text.toLowerCase().indexOf(arg.toLowerCase()) + 1;
				}];
			});
		}
		dirs.forEach(function(dir, idx) {
			if (dir.file && dir.file.exists() && dir.file.isDirectory()) {
				let file = dir.file;
				let path = dir.file.path.replace("/+$", "") + "/";
				context.fork(file.path, 0, this, function (context) {
					let dirPart = arg.match(/^(?:.*[\/\\])?/)[0];
					context.advance(dirPart.length);
					completion.file(context, true, path + arg);
					context.title[0] = path + dirPart;
					context.keys.text = function (f) this.path.substr(path.length+dirPart.length);
					context.filters[0] = function (item) {
						return item.text.toLowerCase().indexOf(context.filter.toLowerCase()) + 1;
					};
				});
			}
		});
	}

}

group.commands.add(["edi[t]", "ei"],
	"Open common folders or files",
	function (args) {
		let create = true;
		let path = "";
		let files = edit.files;
		let dirs = edit.dirs;

		if (args.length == 0) {
			if (files[0])
				path = files[0]["file"].path || files[0]["text"];
			else
				path = edit.RC;
		} else if (edit.isAbsolutePath(args[0])) {
			path = args[0];
		} else {
			path = args[0];
			if (commandline.completionList.selected) {
				let ctx = commandline.completionList.selected[0];
				let idx = commandline.completionList.selected[1];
				path = ctx.items[idx].path;
			} else {
				if (commandline.completionList.context.activeContexts.length) {
					let items = commandline.completionList.context.activeContexts[0].items
					if (items.length >= 1 && (typeof items[0].path == "string")) // 补全列表中只有一个可选项，默认使用。
						path = items[0].path;
				}
			}
		}

		path = File.expandPath(path);
		let command = commandline.command;
		command = command.substr(0, command.lastIndexOf(args[0])) + path;
		commands.repeat = command; // 让 : 寄存器和 @: 工作
		// 重写历史记录，用绝对地址替换
		let store = commandline._store.get("command", []);
		store = commandline._store.set("command",
			store.filter(function (line) (line.value || line) != commandline.command));
		store.push({
			value: command,
			timestamp: Date.now()*1000,
			privateData: commands.hasPrivateData(command)
		});

		var localFile = Components.classes["@mozilla.org/file/local;1"].
			createInstance(Components.interfaces.nsILocalFile);
		let jar_pattern = /\.jar|\.ja|\.xpi$/;
		let isJar = jar_pattern.test(path);


		try {
			localFile.initWithPath(path);
		} catch (e if e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) { // relative path
			dactyl.echoerr(path + " doesn't exists!", commandline.FORCE_SINGLELINE);
			return false;
		} catch (e) {
			dactyl.echoerr(path + " doesn't exists!", commandline.FORCE_SINGLELINE);
			return false;
		}
		if (localFile.exists()) {
			if (args.bang || dactyl.forceBackground || dactyl.forceTarget) {
				let uri = "";
				let action = {};
				if (!isJar)
					uri = "file:///"+path;
				else
					uri = "jar:file:///"+path+"!/";

				if (args.bang)
					action = {where: dactyl.CURRENT_TAB};
				if (dactyl.forceBackground)
					action = {background: true, where: dactyl.NEW_TAB};
				if (dactyl.forceTarget)
					action = {where: dactyl.forceTarget};

				dactyl.open(uri, action);
			} else {
				if (options["open-editor"] && localFile.isFile()) {
					let suffies = options["open-suffix"];
					let base = path.split(PATH_SEP).pop();
					let opened = false;
					for (var i = suffies.length - 1; i >= 0; i--) {
						let pattern = new RegExp(suffies[i].replace(".", "\\.") + "$");
						if (pattern.test(base)) {
							if (config.OS.isWindows) {
								try {
									var file = Components.classes["@mozilla.org/file/local;1"]
									.createInstance(Components.interfaces.nsILocalFile);
									file.initWithPath(options["open-editor"]);

									var process = Components.classes["@mozilla.org/process/util;1"]
									.createInstance(Components.interfaces.nsIProcess);
									process.init(file);
									var args = [path];
									process.run(false, args, args.length);
								} catch (e if e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
									io.run(options["open-editor"], [path], false);
								} catch (e) {
									; // do nth
								}
							} else
								io.run(options["open-editor"], [path], false);
							opened = true;
							break;
						}
					}
					if (!opened)
						openFile(localFile);
				} else
					openFile(localFile);
			}
		} else {
			if (args.bang || !create)
				dactyl.echoerr(path + " doesn't exists!", commandline.FORCE_SINGLELINE);
			else {
				let prompt = "Do you want to create file or directory (" + path + ") y/n: ";
				commandline.input(prompt, function(accept) {
						accept = accept.trim();
						if (accept === "y") {
							try {
								localFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 438); // 438 digit
								if (options["open-editor"] && localFile.isFile()) {
									let suffies = options["open-suffix"];
									let base = path.split(PATH_SEP).pop();
									let opened = false;
									for (var i = suffies.length - 1; i >= 0; i--) {
										let pattern = new RegExp(suffies[i].replace(".", "\\.") + "$");
										if (pattern.test(base)) {
											if (config.OS.isWindows) {
												try {
													var file = Components.classes["@mozilla.org/file/local;1"]
													.createInstance(Components.interfaces.nsILocalFile);
													file.initWithPath(options["open-editor"]);

													var process = Components.classes["@mozilla.org/process/util;1"]
													.createInstance(Components.interfaces.nsIProcess);
													process.init(file);
													var args = [path];
													process.run(false, args, args.length);
												} catch (e if e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
													io.run(options["open-editor"], [path], false);
												} catch (e) {
													; // do nth
												}
											} else
												io.run(options["open-editor"], [path], false);

											opened = true;
											break;
										}
									}
									if (!opened)
										openFile(localFile)
								} else
									openFile(localFile)
							} catch (e if e.result == Cr.NS_ERROR_FILE_ALREADY_EXISTS ) {
								dactyl.echoerr(path + " already exists!", commandline.FORCE_SINGLELINE);
							} catch (e) {
								dactyl.echoerr("Unable to create file : \"" + path + "\"!", commandline.FORCE_SINGLELINE);
							}
						}
					}
				);
			}
		}
	},
	{
		argCount: "?",
		bang: true,
		completer: function (context, args) cpt(context, args), // TODO: expandPath
		literal: 0
	},
	true
);
group.options.add( // TODO: completer, validator
	["open-files", "opfs"],
	"Common files",
	"stringlist",
	"RC,PrefF,ProfD/user.js,UChrm/userChrome.css,UChrm/userContent.css,UChrm/userChrome.js,UChrm/userContent.js",
	{
		completer: function (context) {
			if (edit.isAbsolutePath(context.filter)) {
				completion.file(context, true, context.filter);
			} else {
				if (!context.filter.length) {
					context.fork("option-opfs", 0, this, function (context) {
						completion.file(context, true, File.expandPath("~") + "/");
					});
				}
				context.keys = {
					text: 0,
					description: 1,
					path: 2,
					icon: function (item) "moz-icon://" + item[2]
				};
				context.process[1] = function(item, text) {
					return <><b xmlns:dactyl={NS}>{item["path"]}</b><span> - {item["description"]}</span></>;
				}
				context.completions = edit.FileCpts;
			}
		},
		setter: function (value) {
			return value;
		},
		validator: function (value) true
	}
);

group.options.add( // TODO: completer, validator
	["open-dirs", "opds"],
	"Common directories",
	"stringlist",
	"UChrm,ProfD,CurProcD,DefProfRt,Desk,RUNTIMEPATH,SCRIPTNAMES", // SCRIPTNAMES: virtual directory
	{
		completer: function (context) {
			if (edit.isAbsolutePath(context.filter))
				completion.directory(context, false, context.filter);
			else {
				context.keys = {
					text: 0,
					description: 1,
					path: 2,
					icon: function (item) {
						let icon = "resource://gre/res/html/folder.png";
						switch ( item[0] ) {
							case "SCRIPTNAMES" :
							icon = "moz-icon://.js";
							break;
							case "RUNTIMEPATH" :
							icon = "moz-icon:///";
							break;
							default:
							break;
						}
						return icon;
					}
				}
				context.process[1] = function(item, text) {
					return <><b xmlns:dactyl={NS}>{item["path"]}</b><span> - {item["description"]}</span></>;
				}
				return edit.DirCpts;
			}
		},
		setter: function (value) {
			return value;
		},
		validator: function (value) true
	}
);

function findEditor (string) {
	var str = string.trimLeft();
	var edge = false;
	var index = 0;
	while (!edge && index >= 0) {
		index = str.indexOf(" ", index+1);
		if (index >= 0) {
			if (str[index -1] !== "\\")
				edge = true;
		} else
			edge = true;
	}

	var editor = str;
	if (index >= 0)
		editor = str.substring(0,index);
	return editor;
}

let editors = [];
if (config.OS.isWindows) {
	editors = [
		["notepad.exe", "A simple text editor for Microsoft Windows."],
		["C:\\Program Files\\", "Program Dir"],
		["C:\\Program Files (x86)\\", "Program Dir (x86)"]
	];
} else {
	editors = [
		["emacs", "GNU Emacs"],
		["gvim", "Vi IMproved"],
		["gedit", "The official text editor of the GNOME desktop environment."],
		["kate", "Kate | Get an Edge in Editing"]
	];
}
let editor = findEditor(options["editor"]);
if (editor.length > 0) {
	let duplicated = false;
	editors.forEach(function(item, idx) {
			if (item[0] === editor) {
				editors[idx][1] = "External editor from pentadactyl 'editor' option.";
				duplicated = true;
			}
	})
	if (!duplicated)
		editors.push([editor, "External editor from pentadactyl 'editor' option."]);
}

group.options.add(
	["open-editor", "oped"],
	"Use Custom editor",
	"string",
	"",
	{
		validator: function() true,
		completer: function(context, args) {
			context.fork("oped", 0, this, function (context) {
					if (context.filter)
						completion.file(context, true, context.filter);
					else {
						if (config.OS.isWindows)
							completion.file(context, true, "C:/Program\ Files/");
						else
							completion.file(context, true, "/");
					}
			});

			context.title = ["editor", "description"];
			context.completions = editors;
		},
	}
);

function openFile(file) {
	if (file.isDirectory() && options["open-folder"]) {
		var program = options["open-folder"];
		// create an nsILocalFile for the executable
		var exec = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
		exec.initWithPath(program);

		var process = Components.classes["@mozilla.org/process/util;1"]
		.createInstance(Components.interfaces.nsIProcess);
		process.init(exec);

		var args = [file.path];
		process.run(false, args, args.length);
		return true;
	}
	file.launch();
}

group.options.add( // TODO: PATH environment
	["open-folder", "opfl"],
	"Open folder by custom program.",
	"string",
	"",
	{
		validator: function() true,
		completer: function(context, args) {
			completion.file(context);
		},
	}
);

group.options.add(
	["open-suffix", "opsu"],
	"File patterns that opened by external editor.",
	"stringlist",
	"_pentadactylrc,.pentadactylrc,.penta,.vim,.css,.html,.js,.txt,.ini",
	{
	}
);

var INFO =
<plugin name="edit" version="0.2.0"
	href="https://github.com/grassofhust/dotfiles/blob/master/.pentadactyl/plugins/edit.js"
	summary="Open file or directory quickly."
	xmlns={NS}>
	<info lang="en-US" summary="Open file or directory quickly!"/>
	<info lang="zh-CN" summary="快速打开文件或者目录！"/>
	<author email="frederick.zou@gmail.com">Yang Zou</author>
	<license href="http://opensource.org/licenses/mit-license.php">MIT</license>
	<project name="Pentadactyl" min-version="1.0"/>

	<p lang="en-US"> Open file or folder quickly, has auto completion support.  </p>
	<p lang="zh-CN">快速打开文件或者目录，提供自动补全支持！</p>

	<item lang="en-US">
		<tags>'opfs' 'open-files'</tags>
		<spec>'open-files' 'opfs'</spec>
		<type>stringlist</type>
		<default>RC,PrefF,ProfD/user.js,UChrm/userChrome.css,UChrm/userContent.css,UChrm/userChrome.js,UChrm/userContent.js</default>
		<description>
			<p>Common files</p>
		</description>
	</item>

	<item lang="zh-CN">
		<tags>'opfs' 'open-files'</tags>
		<spec>'open-files' 'opfs'</spec>
		<type>stringlist</type>
		<default>RC,PrefF,ProfD/user.js,UChrm/userChrome.css,UChrm/userContent.css,UChrm/userChrome.js,UChrm/userContent.js</default>
		<description>
			<p>常用文件</p>
		</description>
	</item>

	<item lang="en-US">
		<tags>'opds' 'open-dirs'</tags>
		<spec>'open-dirs' 'opds'</spec>
		<type>stringlist</type>
		<default>UChrm,ProfD,CurProcD,DefProfRt,Desk,RUNTIMEPATH,SCRIPTNAMES</default>
		<description>
			<p>Common directories</p>
		</description>
	</item>

	<item lang="zh-CN">
		<tags>'opds' 'open-dirs'</tags>
		<spec>'open-dirs' 'opds'</spec>
		<type>stringlist</type>
		<default>UChrm,ProfD,CurProcD,DefProfRt,Desk,RUNTIMEPATH,SCRIPTNAMES</default>
		<description>
			<p>常用目录</p>
		</description>
	</item>

	<item lang="en-US">
		<tags>'oped' 'open-editor'</tags>
		<spec>'open-editor' 'oped'</spec>
		<type>string</type>
		<default></default>
		<description>
			<p>External editor. Support file types : <o>opsu</o></p>
		</description>
	</item>

	<item lang="zh-CN">
		<tags>'oped' 'open-editor'</tags>
		<spec>'open-editor' 'oped'</spec>
		<type>string</type>
		<default></default>
		<description>
			<p>用指定的外部编辑器打开外部文件。支持的文件类型见：<o>opsu</o></p>
		</description>
	</item>

	<item lang="en-US">
		<tags>'opsu' 'open-suffix'</tags>
		<spec>'open-suffix' 'opsu'</spec>
		<type>stringlist</type>
		<default>_pentadactylrc,.pentadactylrc,.penta,.vim,.css,.html,.js,.txt,.ini</default>
		<description>
			<p>File patterns that opened by external editor.</p>
		</description>
	</item>

	<item lang="zh-CN">
		<tags>'opsu' 'open-suffix'</tags>
		<spec>'open-suffix' 'opsu'</spec>
		<type>stringlist</type>
		<default>_pentadactylrc,.pentadactylrc,.penta,.vim,.css,.html,.js,.txt,.ini</default>
		<description>
			<p>指定使用外部编辑器打开的文件后缀名列表。</p>
		</description>
	</item>

	<item lang="en-US">
		<tags>open-variables</tags>
		<spec>open-variables</spec>
		<description>
			<p>Files</p>
			<dl dt="width: 6em;">
			{function () {
					let elem = <></>;
					edit.FileCpts.forEach(function (item) {
							elem += <><dt>{item[0]}</dt>    <dd><p>{item[2]}</p><p>{item[1]}</p></dd></>;
					});
					return elem;
				}()}
			</dl>
			<p>Directories</p>
			<dl dt="width: 6em;">
			{function () {
					let elem = <></>;
					edit.DirCpts.forEach(function (item) {
							if (item[0] == "RUNTIMEPATH")
								elem += <><dt>{item[0]}</dt>     <dd><p><o>runtimepath</o></p></dd></>;
							else if (item[0] == "SCRIPTNAMES")
								elem += <><dt>{item[0]}</dt>     <dd><p><ex>:scriptnames</ex></p></dd></>;
							else
								elem += <><dt>{item[0]}</dt>    <dd><p>{item[2]}</p><p>{item[1]}</p></dd></>;
					});
					return elem;
				}()}
			</dl>
			<note><link topic="https://developer.mozilla.org/en/Code_snippets/File_I%2F%2FO#Getting_special_files">Details</link> <link topic="http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsAppDirectoryServiceDefs.h">Directories</link> <link topic="http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsDirectoryServiceDefs.h">More Directories</link></note>
		</description>
	</item>

	<item lang="zh-CN">
		<tags>open-variables</tags>
		<spec>open-variables</spec>
		<description>
			<p>常用文件变量</p>
			<dl dt="width: 6em;">
			{function () {
					let elem = <></>;
					edit.FileCpts.forEach(function (item) {
							elem += <><dt>{item[0]}</dt>    <dd><p>{item[2]}</p><p>{item[1]}</p></dd></>;
					});
					return elem;
				}()}
			</dl>
			<p>常用目录变量</p>
			<dl dt="width: 6em;">
			{function () {
					let elem = <></>;
					edit.DirCpts.forEach(function (item) {
							if (item[0] == "RUNTIMEPATH")
								elem += <><dt>{item[0]}</dt>     <dd><p><o>runtimepath</o></p></dd></>;
							else if (item[0] == "SCRIPTNAMES")
								elem += <><dt>{item[0]}</dt>     <dd><p><ex>:scriptnames</ex></p></dd></>;
							else
								elem += <><dt>{item[0]}</dt>    <dd><p>{item[2]}</p><p>{item[1]}</p></dd></>;
					});
					return elem;
				}()}
			</dl>
			<note><link topic="https://developer.mozilla.org/en/Code_snippets/File_I%2F%2FO#Getting_special_files">详细说明</link> <link topic="http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsAppDirectoryServiceDefs.h">Directories</link> <link topic="http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsDirectoryServiceDefs.h">More Directories</link></note>
		</description>
	</item>

	<item lang="en-US">
		<tags>:edit :ei</tags>
		<spec>:edit<oa>!</oa> <oa>path</oa></spec>
		<description>
			<p>Open file or folder with associated program. When
			<oa>!</oa> is provided, open file or folder in new tab. When <oa>path</oa>
				is empty, open pentadactyl rc file. edit.js can also open ja/jar/xpi
				package in browser or archiver.
			</p>
			<note>You can use :edit with any of <ex>:tab</ex> <ex>:background</ex>
				<ex>:window</ex> .</note>
		</description>
	</item>
	<item lang="zh-CN">
		<tags>:edit :ei</tags>
		<spec>:edit<oa>!</oa> <oa>path</oa></spec>
		<description>
			<p>使用关联程序快速打开文件或者目录，当
			<oa>!</oa> 存在，在当前标签页中打开该文件或者目录。当 <oa>path</oa>
				为空时, 直接打开 pentadactyl 的配置文件。 edit.js 能 
				在当前标签页中打开 ja/jar/xpi 安装包。
			</p>
			<note>:edit 可以与 <link>:tab</link> <link>:background</link>
				<link>:window</link> 联合起来使用！</note>
		</description>
	</item>

</plugin>;


// * -a option, absolute path
// * ~/ expandPath
// * :scriptnames
// chrome list, chrome protocol
// 转换本地 jar/xpi 链接
// * opfs opds
// 使用绝对路径时，无法用部分文件名打开 :ei /tmp/back.ht，自动补全显示且有结果的情况下。
// 考虑自动补全是否打开
// chrome://
// res://
// 'wildcase'
// -b base?
// 使用 orion editor 编辑保存文档
// 将转化为绝对路径的命令加到命令历史中去
