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

const COMMON_DIRS = [
	{path: services.directory.get("ProfD", Ci.nsIFile).path+PATH_SEP+"chrome", description: "ProfD/chrome"},
	{path: services.directory.get("ProfD", Ci.nsIFile).path, description: "profile directory"},
	{path: services.directory.get("CurProcD", Ci.nsIFile).path, description: "installation (usually)"}
];

const COMMON_FILES = [
	{path: services.directory.get("ProfD", Ci.nsIFile).path+PATH_SEP+"prefs.js", description: "Preferences"},
	{path: services.directory.get("ProfD", Ci.nsIFile).path+PATH_SEP+"user.js", description: "User Preferences"},
	{path: services.directory.get("ProfD", Ci.nsIFile).path+PATH_SEP+"chrome"+PATH_SEP+"userChrome.css", description: "User Preferences"},
	{path: services.directory.get("ProfD", Ci.nsIFile).path+PATH_SEP+"chrome"+PATH_SEP+"userContent.css", description: "User Preferences"}
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

	options["runtimepath"].forEach(function(item) {
		rtp.push({path: File.expandPath(item), description: "runtimepath-" + item.split(PATH_SEP).pop()});
		rtp.push({path: File.expandPath(item)+PATH_SEP + "plugins", description: "runtimepath-" + item.split(PATH_SEP).pop()+"-plugins"});
		rtp.push({path: File.expandPath(item)+PATH_SEP + "colors", description: "runtimepath-" + item.split(PATH_SEP).pop()+"-colors"});
	});

	let places = commonFiles.concat(rtp);
	let dirs = rtp.concat(COMMON_DIRS);

	let arg = "";
	if (args.length == 1)
		arg = args[0];

	dirs.forEach(function(dir) {
		context.forkapply(dir.description, 0, completion, 'file', [false, dir.path+PATH_SEP+arg]);
		let lastSub = context.contextList[context.contextList.length - 1];
		lastSub.keys.text = function (item) item.path.replace(dir.path+PATH_SEP, "");
		lastSub.title[0] = dir.path;
		lastSub.filter = arg;
		lastSub.offset = context.offset;
	});

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

		var localFile = Components.classes["@mozilla.org/file/local;1"].
			createInstance(Components.interfaces.nsILocalFile);
		let jar_pattern = /\.jar$/;
		let isJar = jar_pattern.test(path);
		try {
			localFile.initWithPath(path);
			if (args.bang) {
				if (!isJar)
					dactyl.open("file:///"+path, {background:false, where:dactyl.NEW_TAB});
				else
					dactyl.open("jar:file:///"+path+"!/", {background:false, where:dactyl.NEW_TAB});
			} else
				localFile.launch();
		} catch (e) {
			if (args.bang || !create)
				dactyl.echoerr("File or folder doesn't exists", commandline.FORCE_SINGLELINE);
			else {
				let prompt = "Do you want to create file or directory (" + path + ") y/n: ";
				commandline.input(prompt, function(accept) {
						accept = accept.trim();
						if (accept === "y") {
							try {
								localFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 438); // 438 digit
								localFile.launch();
							} catch (e if e.result == Cr.NS_ERROR_FILE_ALREADY_EXISTS ) {
								dactyl.echoerr("File or directory already exists!", commandline.FORCE_SINGLELINE);
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
		argCount: "*",
		bang: true,
		completer: function (context, args) { // TODO: expandPath
			if (args.length <=1)
				cpt(context, args);
			else
				context.completions = [];
		}
	}
);

options.add( // TODO
	["open-files", "opfs"],
	"Common File lists",
	"stringlist",
	"",
	{

	}
);

options.add( // TODO
	["open-dirs", "opds"],
	"Common Directory lists",
	"stringlist",
	"",
	{

	}
);
