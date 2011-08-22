// Console API
var console = {};

// Command Line API
// http://getfirebug.com/wiki/index.php/Command_Line_API
var G = {
	$ : function(id) {
		return "Returns a single element with the given id.";
	},
	$$ : function(selector) {
		return "Returns an array of elements that match the given CSS selector.";
	},
	$x : function(xpath) {
		return "Returns an array of elements that match the given XPath expression.";
	},
	$0 : "The currently-selected object in the inspector.",
	$1 : "The previously-selected object in the inspector.",
	$n : function(index) {
		return "Access to an array of last 5 inspected elements.";
	},
	dir : function(object) {
		return "Prints an interactive listing of all properties of the object. This looks identical to the view that you would see in the DOM tab.";
	},
	dirxml : function(node) {
		return "Prints the XML source tree of an HTML or XML element. This looks identical to the view that you would see in the HTML tab. You can click on any node to inspect it in the HTML tab.";
	},
	cd : function(window) {
		return "By default, command line expressions are relative to the top-level window of the page. cd() allows you to use the window of a frame in the page instead.";
	},
	clear : function() {
		return "Clears the console.";
	},
	inspect : function(object, tabName) {
		return "Inspects an object in the most suitable tab, or the tab identified by the optional argument tabName.";
	},
	keys : function(object) {
		return "Returns an array containing the names of all properties of the object.";
	},
	values : function(object) {
		return "Returns an array containing the values of all properties of the object.";
	},
	debug : function(fn) {
		return "Adds a breakpoint on the first line of a function.";
	},
	undebug : function (fn) {
		return "Removes the breakpoint on the first line of a function.";
	},
	monitor : function (fn) {
		return "Turns on logging for all calls to a function.";
	},
	unmonitor : function (fn) {
		return "Turns off logging for all calls to a function.";
	},
	monitorEvents : function (object, types) {
		return <><![CDATA[Turns on logging for all events dispatched to an object. The optional argument types may specify a specific family of events to log. The most commonly used values for types are "mouse" and "key".

				The full list of available types includes "composition", "contextmenu", "drag", "focus", "form", "key", "load", "mouse", "mutation", "paint", "scroll", "text", "ui", and "xul".]]></>.toString();
	},
	unmonitorEvents : function (object, types) {
		return "Turns off logging for all events dispatched to an object.";
	},
	profile : function (title) {
		return "Turns on the JavaScript profiler. The optional argument title would contain the text to be printed in the header of the profile report.";
	},
	profileEnd : function () {
		return "Turns off the JavaScript profiler and prints its report.";
	},
};

// TODO: suspended
function mappingKey(/*prefix=<Leader>,*/char) {
	return ["<Leader>"+options["firebug-key"]+char];
}

group.options.add(["firebug-key", "fbk"],
	"Firebug Key Bindings Prefix",
	"string",
	"f",
	{

	}
);

group.mappings.add(
	[modes.MAIN],
	mappingKey('c'),
	"Focus Command Editor",
	function() {
		if (!Firebug.isOpen)
			Firebug.toggleBar(true, 'console');
		Firebug.chrome.switchToPanel(Firebug.currentContext, "console");
		enableCurrentPanel();
		Firebug.CommandLine.focus(Firebug.currentContext);
	}
);

group.mappings.add(
	[modes.MAIN],
	mappingKey('e'),
	"Toggle and Focus [MultiLine] Command Editor",
	function() {
		if (!Firebug.isOpen)
			Firebug.toggleBar(true, 'console');
		Firebug.chrome.switchToPanel(Firebug.currentContext, "console");
		enableCurrentPanel();
		Firebug.CommandLine.toggleMultiLine();
		Firebug.CommandLine.focus(Firebug.currentContext);
	}
);

group.mappings.add(
	[modes.MAIN],
	mappingKey('i'),
	"Inspect Element",
	function() {
		// Firebug.setSuspended();
		Firebug.toggleBar(true, "html");
		Firebug.minimizeBar();
		if (!hints.modes["Q"]) {
			hints.addMode("Q", "Inspect Element", function(elem) {
					Firebug.Inspector.startInspecting(Firebug.currentContext);
					Firebug.Inspector.inspectNode(elem);
					Firebug.Inspector.stopInspecting(false, true);
					Firebug.toggleBar(true, "html");
					elem.scrollIntoView();
			}, null, ["*"]);
		}
		modes.push(modes.NORMAL);
		events.feedkeys(";", true, true, modes.NORMAL);
		events.feedkeys("Q", true, true);
		// Firebug.showBar(true);
	}
);

group.mappings.add(
	[modes.MAIN],
	mappingKey('f'),
	"Toggle Firebug!",
	function() {
		Firebug.toggleBar();
	}
);

let panels = Firebug.panelTypes.filter(function (panel) {
		if (panel.prototype.parentPanel)
			return false;
		return true;
}).sort(function(a, b) {
		return a.prototype.order - b.prototype.order;
});
panels.forEach(function (panelType, index) {
		let name = panelType.prototype.name;
		let title = Firebug.getPanelTitle(panelType);
		group.mappings.add(
			[modes.MAIN],
			mappingKey(index+1),
			// ["<F"+(index+1)+">"],
			"Switch to " + title + " Panel!",
			function() {
				Firebug.toggleBar(true, name);
				// if (Firebug.isMinimized() || Firebug.defaultPanelName !== name)
				// Firebug.toggleBar(true, name);
				// else
				// Firebug.toggleBar();
			}
		);
});

function enableCurrentPanel() {
	var panelBar = Firebug.chrome.$("fbPanelBar1");
	var panelType = panelBar.selectedTab.panelType;
	if (panelType.prototype.setEnabled) {
		panelType.prototype.setEnabled(true);
		panelBar.updateTab(panelType);
	}
}

function execute(code) { // TODO: failed when firebug is suspendeded
	let cl = Firebug.CommandLine;
	Firebug.toggleBar(true, "console");
	enableCurrentPanel();
	let context = Firebug.currentContext;
	cl.enter(context, code);
}

group.mappings.add(
	[modes.NORMAL],
	mappingKey('q'),
	"Toggle QuickInfoBar",
	function() {
		Firebug.Inspector.toggleQuickInfoBox();
	}
);

group.commands.add(["fireb[ug]", "fb"],
	"fireb[ug] or fb: Use Pentadactyl CommandLine to Control Firebug!",
	function (args) {
		if (args.length==0) {
			Firebug.toggleBar();
			return true;
		}
		let code = args[0];
		execute(code);
	},
	{
		bang: true,
		// completer: completion.javascript,
		completer: function(context, args) {
			context.regenerate = true;
			var wrapped = content.wrappedJSObject;
			// update(wrapped, G); // NB: dangerous, plz never use it
			// wrapped.console = console;
			var localcontext = modules.newContext(wrapped, true);
			var web = modules.JavaScript();
			web.newContext = function newContext() modules.newContext(localcontext, true);

			web.globals = [
				[wrapped.console, "Console API"],
				[G, "Command Line API"],
			].concat(web.globals.filter(function ([global]) isPrototypeOf.call(global, wrapped)));

			context.fork("js", 0, web, "complete");
		},
		literal: 0
	},
	true
);

let panelBar1 = panels.map(function(panelType) {
		return [panelType.prototype.name, Firebug.getPanelTitle(panelType)];
});
function subPanel(mainPanel) {
	return Firebug.panelTypes.filter(function (panelType) {
		if (panelType.prototype.parentPanel == mainPanel)
			return true;
		return false;
		}).map(function(panelType) {
			return [panelType.prototype.name, Firebug.getPanelTitle(panelType)];
	});
}

group.commands.add(["firebug-panel", "fbp"],
	"firebug-panel or fbp: Use Pentadactyl CommandLine to Switch Firebug Panel!",
	function (args) {
		if (args.length==0) {
			Firebug.toggleBar();
		} else
			Firebug.toggleBar(true, args[0]);
		if (args[1])
			Firebug.chrome.selectSidePanel(args[1]);
	},
	{
		bang: true,
		completer: function(context, args) {
			if (args.length <= 1)
				context.completions = panelBar1;
			else
				context.completions = subPanel(args[0]);
		},
		literal: 1
	},
	true
);

Components.utils.import("resource://gre/modules/NetUtil.jsm");
group.commands.add(["firebug-load", "fbl"],
	"load file",
	function (args) {
		let filename = args[0];
		if (!File.isAbsolutePath(filename))
			filename = io.cwd.path + File.PATH_SEP + filename;
		filename = File.expandPath(filename);
		var localFile = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);
		try {
			localFile.initWithPath(filename);
			if (localFile.isFile() && localFile.isReadable()) {

				NetUtil.asyncFetch(localFile, function(inputStream, status) {
						if (!Components.isSuccessCode(status)) {
							// Handle error!
							return;
						}

						// The file data is contained within inputStream.
						// You can read it into a string with
						var code = NetUtil.readInputStreamToString(inputStream, inputStream.available());
						execute(code);

				});
			} else {
				dactyl.echoerr("文件不可读或者是错误");
			}
		} catch (e) {
			dactyl.echoerr("打开文件失败!");
		} finally {

		}
	},
	{
		bang: true,
		completer: function (context, args) {
			context.filters.push(function (item) {
				return item.isdir || /\.jsm?$/.test(item.path);
			});
			completion.file(context, true);
		},
		literal: 0
	},
	true
);
