"use strict";
XML.ignoreWhitespace = XML.prettyPrinting = false;
var INFO =
<plugin name="edit" version="0.1.1"
        href="http://dactyl.sf.net/pentadactyl/plugins#smooth-scroll-plugin"
        summary="Open file or directory quickly."
        xmlns={NS}>
    <author email="frederick.zou@gmail.com">Yang Zou</author>
    <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
    <project name="Pentadactyl" min-version="1.0"/>
    <p>
		Open file or folder quickly, has auto completion support.
    </p>
    <item>
        <tags>:edit :ei</tags>
        <spec>:edi[t]! [path]</spec>
        <description>
            <p>Open file or folder with associated program. When
			[!] is provided, open file or folder in new tab. When [path]
			is empty, open pentadactyl rc file. edit.js also can open jar
			package in browser or archiver.
        </p>
        </description>
    </item>
</plugin>;

function getRCFile() {
	// stolen from content/dactyl.js
	let init = services.environment.get(config.idName + "_INIT");
	let rcFile = io.getRCFile("~");

	try {
		if (dactyl.commandLineOptions.rcFile) {
			let filename = dactyl.commandLineOptions.rcFile;
			if (!/^(NONE|NORC)$/.test(filename))
				return io.File(filename).path;
		} else {
			if (init)
				; // do nth
			else {
				if (rcFile)
					return rcFile.path;
			}

			if (options["exrc"] && !dactyl.commandLineOptions.rcFile) {
				let localRCFile = io.getRCFile(io.cwd);
				if (localRCFile && !localRCFile.equals(rcFile))
					return localRCFile.path;
			}
		}
	} finally {
		; // do nth
	}
	return false;
}

const PATH_SEP = File.PATH_SEP;
// const PATH_SEP = "/";

const COMMON_DIRS = [
	{path: services.directory.get("UChrm", Ci.nsIFile).path, description: "User Chrome Directory"},
	{path: services.directory.get("ProfD", Ci.nsIFile).path, description: "User Profile Directory"},
	{path: services.directory.get("CurProcD", Ci.nsIFile).path, description: "Installation (usually)"},
	{path: services.directory.get("DefProfRt", Ci.nsIFile).path, description: "User Directory"},
	{path: services.directory.get("Desk", Ci.nsIFile).path, description: "Desktop Directory"}
];

const COMMON_FILES = [
	{path: services.directory.get("PrefF", Ci.nsIFile).path, description: "Preferences"},
	{path: services.directory.get("ProfD", Ci.nsIFile).path+PATH_SEP+"user.js", description: "User Preferences"},
	{path: services.directory.get("UChrm", Ci.nsIFile).path+PATH_SEP+"userChrome.css", description: "CSS for the UI chrome of the Mozilla application"},
	{path: services.directory.get("UChrm", Ci.nsIFile).path+PATH_SEP+"userContent.css", description: "CSS for content inside windows"}
];

let rcfile = getRCFile();
let commonFiles = [];
if (rcfile)
	commonFiles.push({path: rcfile, description: "RC FILE"});
COMMON_FILES.forEach(function(item) {
	commonFiles.push(item);
});
COMMON_DIRS.forEach(function(item) {
	commonFiles.push(item);
});

let it = [];

function cpt(context, args) {
	let rtp = [];

	io.getRuntimeDirectories("").forEach(function(item) {
		rtp.push({path: item.path, description: "runtimepath-" + item.leafName});
		// rtp.push({path: item.path+PATH_SEP+"plugins", description: "runtimepath-" + item.leafName+"-plugins"});
		// rtp.push({path: item.path+PATH_SEP+"colors", description: "runtimepath-" + item.leafName+"-colors"});
	});

	let places = commonFiles.concat(rtp);
	let dirs = rtp.concat(COMMON_DIRS);

	let arg = "";
	if (args.length == 1)
		arg = args[0];

	let absolute_pattern = /^(~\/|\/|~[^\/]+\/)/;
	if (util.OS.isWindows)
		absolute_pattern = /^[a-zA-Z]:[\/\\]|~/;

	if (absolute_pattern.test(arg)) {
		let dir = {path:arg, description:"Absolute Path"};
		context.forkapply(dir.description, 0, completion, 'file', [false, dir.path]);
		let lastSub = context.contextList[context.contextList.length - 1];
		lastSub.title[0] = arg.match(/^(?:.*[\/\\])?/)[0];
	} else {
		dirs.forEach(function(dir, idx) {
			let aFile = new File(dir.path+PATH_SEP+arg);
			if (aFile.exists() && aFile.isDirectory() && (arg === "" || File.expandPath(arg[arg.length -1]) === File.expandPath(PATH_SEP))) {
				context.forkapply(dir.description, 0, completion, 'file', [false, aFile.path+PATH_SEP]);
				let lastSub = context.contextList[context.contextList.length - 1];
				lastSub.title[0] = aFile.path+PATH_SEP;
				lastSub.filter = "";
				lastSub.offset = arg.length + context.offset;

			} else {
				context.forkapply(dir.description, 0, completion, 'file', [false, aFile.path]);
				let lastSub = context.contextList[context.contextList.length - 1];
				lastSub.title[0] = aFile.parent.path + PATH_SEP;
				lastSub.filter = aFile.leafName;
				lastSub.offset = arg.length - aFile.leafName.length+context.offset;
			}
		});
	}

	context.title = ["Shortcuts", "Description"];
	context.keys = {
		text: "path",
		description: "description",
		path: function (item) item.path
	};
	context.filters = [];
	context.generate = function () places;
	context.compare = null;
	context.filters.push(function (item) {
		return item.item.path.toLowerCase().indexOf(arg.toLowerCase()) >= 0 || File.expandPath((item.item.description)).toLowerCase().indexOf(arg.toLowerCase()) >= 0;
	});
	it = context.allItems;
}

group.commands.add(["edi[t]", "ei"],
	"Open common folders or files",
	function (args) {
		let create = false;
		let path = "";
		if (args.length == 0) {
			path = commonFiles[0]["path"];
		} else
			path = args[0];

		if (commandline.completionList._selIndex >= 0) {
			path = it.items[commandline.completionList._selIndex].path;
			create = true;
		} else {
			if (typeof it.items === "undefined") // 未弹出自动补全窗口
				; // do nth
			else { // 没有选择自动补全
				create = true;
				if (it.items.length == 1) // 补全列表中只有一个可选项，默认使用。
					path = it.items[0].path;
				else if (it.items.length == 0)
					create = false;
				else // 多于1项，取第一项
					path = it.items[0].path;
			}
		}
		// let absolute_pattern = /^\//;
		let absolute_pattern = /^(~\/|\/|~[^\/]+\/)/;
		if (util.OS.isWindows)
			absolute_pattern = /^[a-zA-Z]:[\/\\]|~/;

		if (absolute_pattern.test(args[0]))
			path = args[0];

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
							if (util.OS.isWindows) {
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
						localFile.launch();
				} else
					localFile.launch();
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
											if (util.OS.isWindows) {
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
										localFile.launch();
								} else
									localFile.launch();
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
	}
);

options.add( // TODO
	["open-files", "opfs"],
	"Common File lists",
	"stringmap",
	"",
	{

	}
);

options.add( // TODO
	["open-dirs", "opds"],
	"Common Directory lists",
	"stringmap",
	"",
	{

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
if (util.OS.isWindows) {
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

options.add(
	["open-editor", "oped"],
	"Use Custom editor",
	"string",
	"",
	{
		validator: function() true,
		completer: function(context, args) {
			context.forkapply("oped", 0, completion, 'file', [false, args[0]]);
			// let lastSub = context.contextList[context.contextList.length - 1];
			// lastSub.offset = args[0].length + context.offset;

			context.title = ["editor", "description"];
			context.completions = editors;
		},
	}
);

options.add(
	["open-suffix", "opsu"],
	"File patterns opened by external editor.",
	"stringlist",
	"_pentadactylrc,.pentadactylrc,.penta,.vim,.css,.html,.js,.txt,.ini",
	{
	}
);

// * -a option, absolute path
// * ~/ expandPath
// :scriptnames
