// dactyl.assert(!("LOADED_EDIT_JS" in userContext), (new Error).fileName + " has already been loaded!");
// userContext.LOADED_EDIT_JS = true;
// "use strict";
XML.ignoreWhitespace = XML.prettyPrinting = false;

var PATH_SEP = File.PATH_SEP;

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
			['RC', 'rc file: ' + edit.RC],
			['PrefF', 'PrefF: ' + services.directory.get("PrefF", Ci.nsIFile).path]
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
			return [path, description + ": " + services.directory.get(path, Ci.nsIFile).path];
	}).concat([
			['~', 'user home: ' + File.expandPath('~')],
			['RUNTIMEPATH', "runtimepath: " + ":help 'runtimepath'"],
			['SCRIPTNAMES', ':scriptnames: ' + ":help :scriptnames"]
	]);
		return edit._DirCpts;
	},
	get VAILD_FILES() edit._VAILD_FILES || edit._setVAILD_FILES(),
	_setVAILD_FILES: function () {
		edit._VAILD_FILES = edit.FileCpts.map(function (item) {
				return item[0];
		});
		return edit._VAILD_FILES;
	},
	get VAILD_DIRS() edit._VAILD_DIRS || edit._setVAILD_DIRS(),
	_setVAILD_DIRS: function () {
		edit._VAILD_DIRS = edit.DirCpts.map(function (item) {
				return item[0];
		});
		return edit._VAILD_DIRS;
	},
	isAbsolutePath: function(path) {
		let absolute_pattern = /^(~\/|\/|~[^\/]+\/)/;
		if (config.OS.isWindows)
			absolute_pattern = /^[a-zA-Z]:[\/\\]|~/;
		return absolute_pattern.test(path);
	},

	get files() edit._files,
	set files(value) {
		edit._files = value;
	},
	getFiles: function(value) {
		let _files = [];
		value.forEach(function (path) {
				let _item = {path: path};
				if (edit.VAILD_FILES.indexOf(path) >= 0) {
					switch (path) {
						case "RC" :
						_item.path = edit.RC;
						break;

						default :
						_item.path = services.directory.get(path, Ci.nsIFile).path;
						break;
					}
					_files.push(_item);
					return;
				}
				if (!edit.isAbsolutePath(path)) {
					let DIR = path.split(/\\|\//)[0];
					if (edit.VAILD_DIRS.indexOf(DIR) < 0) {
						window.alert("不存在的常量: " + DIR);
						return;
					}

					switch (DIR) {
						case "RUNTIMEPATH":
						io.getRuntimeDirectories("").forEach(function(item) {
								_files.push({path: item.path + path.slice(DIR.length)});
						});
						return;
						break;

						default:
						_item.path = services.directory.get(DIR, Ci.nsIFile).path + path.slice(DIR.length);
						break;
					}
				}
				_files.push(_item);
		});
		return _files;
	},
	get dirs() edit._dirs,
	set dirs(value) {
		edit._dirs = value;
	},
	getDirs: function (value) {
		let _dirs = [];
		value.forEach(function (path) {
				if (path === "SCRIPTNAMES")
					return;
				let _item = {path: path, opds: true, raw: path};
				if (!edit.isAbsolutePath(path)) {
					let DIR = path.split(/\\|\//)[0] || path;
					if (edit.VAILD_DIRS.indexOf(DIR) < 0) {
						window.alert("不存在的常量: " + DIR);
						return;
					}

					switch (DIR) {
						case "RUNTIMEPATH":
						io.getRuntimeDirectories("").forEach(function(item) {
								_dirs.push({path: item.path + path.slice(DIR.length), opds: true, raw: "RUNTIMEPATH"});
						});
						return;
						break;

						default:
						_item.path = services.directory.get(DIR, Ci.nsIFile).path + path.slice(DIR.length);
						break;
					}
				}
				_dirs.push(_item);
		});

		return _dirs;
	}
}
function cpt(context, args) {
	let offset = context.offset;
	let dirs = edit.dirs;
	let places = edit.files.concat(dirs);

	let arg = "";
	if (args.length == 1)
		arg = args[0];

	// :scriptnames
	if (options["open-dirs"].indexOf("SCRIPTNAMES") >= 0) {
		context.fork("scriptnames", 0, this, function (context) {
				context.title= ["scriptnames", "path"];
				let completions = [];
				context.compare = null;
				Object.keys(io._scriptNames).forEach(function(filename) {
						completions.push({filename:filename, basename:(new File(filename)).leafName});
				});
				context.completions = completions;
				context.keys = {text: 'basename', description:'filename',path: 'filename'};
		});
	}

	if (edit.isAbsolutePath(arg)) {
		let dir = {path:arg, description:"Absolute Path"};
		context.fork(dir.path, 0, this, function (context) {
				completion.file(context, false, dir.path);
				context.title[0] = arg.match(/^(?:.*[\/\\])?/)[0];
		});
	} else {
		dirs.forEach(function(dirObj, idx) {
			let dir = dirObj.path;
			context.fork(dir, 0, this, function (context) {
				let dirPart = arg.match(/^(?:.*[\/\\])?/)[0];
				context.advance(dirPart.length);
				dir = dir.replace("/+$", "") + "/";
				completion.file(context, true, dir + arg);
				context.title[0] = dir + dirPart;
				context.keys.text = function (f) this.path.substr(dir.length+dirPart.length);
			});
		});
	}

	context.title = ["Shortcuts", "path"];
	context.keys = {
		text: function (item) "opds" in item ? item.path : (new File(item.path)).leafName,
		description: function (item) "opds" in item ? item.raw : item.path,
		icon: function (item) "opds" in item ? "resource://gre/res/html/folder.png"
									  : "moz-icon://" + (new File(item.path)).leafName,
		path: function (item) item.path
	};
	context.filters = [];
	context.generate = function () places;
	context.compare = null;
	context.filters.push(function (item) {
			// FIXME: item.item
			if (item.item.opds) {
				return item.item.path.toLowerCase().indexOf(arg.toLowerCase()) == 0 || item.item.raw.toLowerCase().indexOf(arg.toLowerCase()) == 0;
			} else {
				return (new File(item.item.path)).leafName.toLowerCase().indexOf(arg.toLowerCase()) == 0;
			}
	});
}

group.commands.add(["edi[t]", "ei"],
	"Open common folders or files",
	function (args) {
		let create = false;
		let path = "";
		if (args.length == 0) {
			if (edit.files[0])
				path = edit.files[0]["path"];
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
				create = true;
			} else {
				let items = commandline.completionList.context.activeContexts[0].items
				create = true;
				if (items.length >= 1 && (typeof items[0].path == "string")) // 补全列表中只有一个可选项，默认使用。
					path = items[0].path;
				else
					create = false;
			}
		}

		path = File.expandPath(path);

		var localFile = Components.classes["@mozilla.org/file/local;1"].
		createInstance(Components.interfaces.nsILocalFile);
		let jar_pattern = /\.jar|\.xpi$/;
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
			if (args.bang) {
				if (!isJar)
					dactyl.open("file:///"+path, {background:false, where:dactyl.NEW_TAB});
				else
					dactyl.open("jar:file:///"+path+"!/", {background:false, where:dactyl.NEW_TAB});
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
								; //
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
			if (edit.isAbsolutePath(context.filter))
				completion.file(context, false, context.filter);
			else {
				context.process[1] = function(item, text) {
					let [description, path,] = text.split(/: /);
					return <><b xmlns:dactyl={NS}>{path}</b><span> - {description}</span></>;
				}
				return edit.FileCpts;
			}
		},
		setter: function (value) {
			edit.files = edit.getFiles(value);
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
				context.process[1] = function(item, text) {
					let [description, path,] = text.split(/: /);
					return <><b xmlns:dactyl={NS}>{path}</b><span> - {description}</span></>;
				}
				return edit.DirCpts;
			}
		},
		setter: function (value) {
			edit.dirs = edit.getDirs(value);
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
					completion.file(context, false, args[0]);
			});
			// context.forkapply("oped", 0, completion, 'file', [false, args[0]]);

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
							let [description, path] = item[1].split(/: /);
							elem += <><dt>{item[0]}</dt>    <dd><p>{path}</p><p>{description}</p></dd></>;
					});
					return elem;
				}()}
			</dl>
			<p>Directories</p>
			<dl dt="width: 6em;">
			{function () {
					let elem = <></>;
					edit.DirCpts.forEach(function (item) {
							let [description, path] = item[1].split(/: /);
							elem += <><dt>{item[0]}</dt>    <dd><p>{path}</p><p>{description}</p></dd></>;
					});
					let rtp = <></>;
					io.getRuntimeDirectories("").forEach(function(item) {
							rtp += <><p>{item.path}</p></>;
					});
					elem += <><dt>RUNTIMEPATH</dt><dd>{rtp}<p><o>runtimepath</o></p></dd></>;
					return elem;
				}()}
			<dt>SCRIPTNAMES</dt>      <dd><ex>:scriptnames</ex> output</dd>
			</dl>
			<note><link topic="https://developer.mozilla.org/en/Code_snippets/File_I%2F%2FO#Getting_special_files">Details</link> <link topic="http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsAppDirectoryServiceDefs.h">Directories</link><link topic="http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsDirectoryServiceDefs.h">More Directories</link></note>
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
							let [description, path] = item[1].split(/: /);
							elem += <><dt>{item[0]}</dt>    <dd><p>{path}</p><p>{description}</p></dd></>;
					});
					return elem;
				}()}
			</dl>
			<p>常用目录变量</p>
			<dl dt="width: 6em;">
			{function () {
					let elem = <></>;
					edit.DirCpts.forEach(function (item) {
							let [description, path] = item[1].split(/: /);
							elem += <><dt>{item[0]}</dt>    <dd><p>{path}</p><p>{description}</p></dd></>;
					});
					let rtp = <></>;
					io.getRuntimeDirectories("").forEach(function(item) {
							rtp += <><p>{item.path}</p></>;
					});
					elem += <><dt>RUNTIMEPATH</dt><dd>{rtp}<p><o>runtimepath</o></p></dd></>;
					return elem;
				}()}
			<dt>SCRIPTNAMES</dt>      <dd><ex>:scriptnames</ex> output</dd>
			</dl>
			<note><link topic="https://developer.mozilla.org/en/Code_snippets/File_I%2F%2FO#Getting_special_files">详细说明</link> <link topic="http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsAppDirectoryServiceDefs.h">Directories</link><link topic="http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsDirectoryServiceDefs.h">More Directories</link></note>
		</description>
	</item>

	<item lang="en-US">
		<tags>:edit :ei</tags>
		<spec>:edit<oa>!</oa> <oa>path</oa></spec>
		<description>
			<p>Open file or folder with associated program. When
			<oa>!</oa> is provided, open file or folder in new tab. When <oa>path</oa>
				is empty, open pentadactyl rc file. edit.js can also open jar
				package in browser or archiver.
			</p>
		</description>
	</item>
	<item lang="zh-CN">
		<tags>:edit :ei</tags>
		<spec>:edit<oa>!</oa> <oa>path</oa></spec>
		<description>
			<p>使用关联程序快速打开文件或者目录，当
			<oa>!</oa> 存在，在新标签页中打开该文件或者目录。当 <oa>path</oa>
				为空时, 直接打开 pentadactyl 的配置文件。 edit.js 能 
				在新标签页中打开 xpi/jar 安装包。
			</p>
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

