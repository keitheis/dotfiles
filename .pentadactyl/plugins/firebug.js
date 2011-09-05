"use strict";

let FB = (function () { // TODO

	return {
		execute: function execute(code) {

		},
	};
}());

// Command Line API
// http://getfirebug.com/wiki/index.php/Command_Line_API
var G = {
	$0 : "The currently-selected object in the inspector.",
	$1 : "The previously-selected object in the inspector.",
	$ : function(id) {
		return <dl>
			<dt highlight="Function"><![CDATA[$(id)]]></dt>
			<dd>Returns a single element with the given id.</dd>
		</dl>;
	},
	$$ : function(selector) {
		return <dl>
			<dt highlight="Function">$$(selector)</dt>
			<dd>Returns an array of elements that match the given CSS selector.</dd>
		</dl>;
	},
	$x : function(xpath) {
		return <dl>
			<dt highlight="Function"><![CDATA[$x(xpath)]]></dt>
			<dd>Returns an array of elements that match the given XPath expression.</dd>
		</dl>;
	},
	$n : function(index) {
		return <dl>
			<dt highlight="Function">$n(index)</dt>
			<dd>Access to an array of last 5 inspected elements.</dd>
		</dl>;
	},
	dir : function(object) {
		return <dl>
			<dt highlight="Function">dir(object)</dt>
			<dd>Prints an interactive listing of all properties of the object. This looks identical to the view that you would see in the DOM tab.</dd>
		</dl>;
	},
	dirxml : function(node) {
		return <dl>
			<dt highlight="Function">dirxml(node)</dt>
			<dd>Prints the XML source tree of an HTML or XML element. This looks identical to the view that you would see in the HTML tab. You can click on any node to inspect it in the HTML tab.</dd>
		</dl>;
	},
	cd : function(window) {
		return <dl>
			<dt highlight="Function">cd(window)</dt>
			<dd>By default, command line expressions are relative to the top-level window of the page. cd() allows you to use the window of a frame in the page instead.</dd>
		</dl>;
	},
	clear : function() {
		return <dl>
			<dt highlight="Function">clear()</dt>
			<dd>Clears the console.</dd>
		</dl>;
	},
	inspect : function(object, tabName) {
		return <dl>
			<dt highlight="Function">inspect(object[, tabName])</dt>
			<dd>Inspects an object in the most suitable tab, or the tab identified by the optional argument tabName.</dd>
		</dl>;
	},
	keys : function(object) {
		return <dl>
			<dt highlight="Function">keys(object)</dt>
			<dd>Returns an array containing the names of all properties of the object.</dd>
		</dl>;
	},
	values : function(object) {
		return <dl>
			<dt highlight="Function">values(object)</dt>
			<dd>Returns an array containing the values of all properties of the object.</dd>
		</dl>;
	},
	debug : function(fn) {
		return <dl>
			<dt highlight="Function">debug(fn)</dt>
			<dd>Adds a breakpoint on the first line of a function.</dd>
		</dl>;
	},
	undebug : function (fn) {
		return <dl>
			<dt highlight="Function">undebug(fn)</dt>
			<dd>Removes the breakpoint on the first line of a function.</dd>
		</dl>;
	},
	monitor : function (fn) {
		return <dl>
			<dt highlight="Function">monitor(fn)</dt>
			<dd>Turns on logging for all calls to a function.</dd>
		</dl>;
	},
	unmonitor : function (fn) {
		return <dl>
			<dt highlight="Function">unmonitor(fn)</dt>
			<dd>Turns off logging for all calls to a function.</dd>
		</dl>;
	},
	monitorEvents : function (object, types) {
		return <dl>
			<dt highlight="Function">monitorEvents(object[, types])</dt>
			<dd>Turns on logging for all events dispatched to an object. The optional argument types may specify a specific family of events to log. The most commonly used values for types are "mouse" and "key".<p></p>
			The full list of available types includes "composition", "contextmenu", "drag", "focus", "form", "key", "load", "mouse", "mutation", "paint", "scroll", "text", "ui", and "xul".</dd>
		</dl>;
	},
	unmonitorEvents : function (object, types) {
		return <dl>
			<dt highlight="Function">unmonitorEvents(object[, types])</dt>
			<dd>Turns off logging for all events dispatched to an object.</dd>
		</dl>;
	},
	profile : function (title) {
		return <dl>
			<dt highlight="Function">profile([title])</dt>
			<dd>Turns on the JavaScript profiler. The optional argument title would contain the text to be printed in the header of the profile report.</dd>
		</dl>;
	},
	profileEnd : function () {
		return <dl>
			<dt highlight="Function">profileEnd()</dt>
			<dd>Turns off the JavaScript profiler and prints its report.</dd>
		</dl>;
	},
	console: {
		log: function (object) {
			return <dl>
				<dt highlight="Function">console.log(object[, object, ...])</dt>
				<dd>
					Writes a message to the console. You may pass as many arguments as you'd like, and they will be joined together in a space-delimited line.
					<p>The first argument to log may be a string containing printf-like string substitution patterns. For example:</p>

					<p class="code_block">console.log("The %s jumped over %d tall buildings", animal, count);</p>

					<p>The example above can be re-written without string substitution to achieve the same result:</p>

					<p class="code_block">console.log("The", animal, "jumped over", count, "tall buildings");</p>

					<p>These two techniques can be combined. If you use string substitution but provide more arguments than there are substitution patterns, the remaining arguments will be appended in a space-delimited line, like so:</p>

					<p class="code_block">console.log("I am %s and I have:", myName, thing1, thing2, thing3);</p>

					<p>If objects are logged, they will be written not as static text, but as interactive hyperlinks that can be clicked to inspect the object in Firebug's HTML, CSS, Script, or DOM tabs. You may also use the %o pattern to substitute a hyperlink in a string.</p>

					<p>You may also use the %c pattern to use the second argument as a style formatting parameter. For example:</p>

					<p class="code_block">console.log('%cThis is red text on a green background', 'color:red; background-color:green');</p>

					<p>Here is the complete set of patterns that you may use for string substitution:</p>
					<table>
						<thead><tr><th>Pattern</th><th>Type</th></tr></thead>
						<tbody>
						<tr><td>%s</td><td>String</td></tr>
						<tr><td>%d, %i</td><td>Integer (numeric formatting is not yet supported)</td></tr>
						<tr><td>%f</td><td>Floating point number (numeric formatting is not yet supported)</td></tr>
						<tr><td>%o</td><td>Object hyperlink</td></tr>
						<tr><td>%c</td><td>Style formatting</td></tr>
						</tbody>
					</table>
				</dd>
			</dl>;
		},
		debug: function (object) {
			return <dl>
				<dt highlight="Function">console.debug(object[, object, ...])</dt>
				<dd>Writes a message to the console, including a hyperlink to the line where it was called.</dd>
			</dl>;
		},
		info: function (object) {
			return <dl>
				<dt highlight="Function">console.info(object[, object, ...])</dt>
				<dd>Writes a message to the console with the visual "info" icon and color coding and a hyperlink to the line where it was called.</dd>
			</dl>;
		},
		warn: function (object) {
			return <dl>
				<dt highlight="Function">console.warn(object[, object, ...])</dt>
				<dd>Writes a message to the console with the visual "warning" icon and color coding and a hyperlink to the line where it was called.</dd>
			</dl>;
		},
		error: function (object) {
			return <dl>
				<dt highlight="Function">console.error(object[, object, ...])</dt>
				<dd>Writes a message to the console with the visual "error" icon and color coding and a hyperlink to the line where it was called.</dd>
			</dl>;
		},
		assert: function(expression) {
			return <dl>
				<dt highlight="Function">console.assert(expression[, object, ...])</dt>
				<dd>Tests that an expression is true. If not, it will write a message to the console and throw an exception.</dd>
			</dl>;
		},
		clear: function () {
			return <dl>
				<dt highlight="Function">console.clear()</dt>
				<dd>Clears the console.</dd>
			</dl>;
		},
		dir: function (object) {
			return <dl>
				<dt highlight="Function">console.dir(object)</dt>
				<dd>Prints an interactive listing of all properties of the object. This looks identical to the view that you would see in the DOM tab.</dd>
			</dl>;
		},
		dirxml: function (node) {
			return <dl>
				<dt highlight="Function">console.dirxml(node)</dt>
				<dd>Prints the XML source tree of an HTML or XML element. This looks identical to the view that you would see in the HTML tab. You can click on any node to inspect it in the HTML tab.</dd>
			</dl>;
		},
		trace: function () {
			return <dl>
				<dt highlight="Function">console.trace()</dt>
				<dd>Prints an interactive stack trace of JavaScript execution at the point where it is called.<p></p>

				The stack trace details the functions on the stack, as well as the values that were passed as arguments to each function. You can click each function to take you to its source in the Script tab, and click each argument value to inspect it in the DOM or HTML tabs.</dd>
			</dl>;
		},
		group: function (object) { // TODO: Call <i>console.groupEnd()</i>
			return <dl>
				<dt highlight="Function">console.group(object[, object, ...])</dt>
				<dd>Writes a message to the console and opens a nested block to indent all future messages sent to the console. Call <i highlight="Function">console.groupEnd()</i> to close the block.</dd>
			</dl>;
		},
		groupCollapsed: function (object) {
			return <dl>
				<dt highlight="Function">console.groupCollapsed(object[, object, ...])</dt>
				<dd>Like <i highlight="Function">console.group()</i>, but the block is initially collapsed.</dd>
			</dl>;
		},
		groupEnd: function () {
			return <dl>
				<dt highlight="Function">console.groupEnd()</dt>
				<dd>Closes the most recently opened block created by a call to <i highlight="Function">console.group()</i> or <i highlight="Function">console.groupCollapsed()</i></dd>
			</dl>;
		},

		time: function (name) {
			return <dl>
				<dt highlight="Function">console.time(name)</dt>
				<dd>Creates a new timer under the given name. Call <i highlight="Function">console.timeEnd(name)</i> with the same name to stop the timer and print the time elapsed.</dd>
			</dl>;
		},

		timeEnd: function (name) {
			return <dl>
				<dt highlight="Function">console.timeEnd(name)</dt>
				<dd>Stops a timer created by a call to <i highlight="Function">console.time(name)</i> and writes the time elapsed.</dd>
			</dl>;
		},

		timeStamp: function (object) {
			return <dl>
				<dt highlight="Function">console.timeStamp([object])</dt>
				<dd>Prints a timestamp, works like <i highlight="Function">console.log(object)</i>.</dd>
			</dl>;
		},

		profile: function (title) {
			return <dl>
				<dt highlight="Function">console.profile([title])</dt>
				<dd>Turns on the JavaScript profiler. The optional argument <i highlight="String">title</i> would contain the text to be printed in the header of the profile report.</dd>
			</dl>;
		},

		profileEnd: function () {
			return <dl>
				<dt highlight="Function">console.profileEnd()</dt>
				<dd>Turns off the JavaScript profiler and prints its report.</dd>
			</dl>;
		},

		memoryProfile: function (title) {
			return <dl>
				<dt highlight="Function">console.memoryProfile([title])</dt>
				<dd>Turns on memory profile.</dd>
			</dl>;
		},

		memoryProfileEnd: function () {
			return <dl>
				<dt highlight="Function">console.memoryProfileEnd()</dt>
				<dd>Turns off memory profile.</dd>
			</dl>;
		},

		count: function (title) {
			return <dl>
				<dt highlight="Function">console.count([title])</dt>
				<dd>Writes the number of times that the line of code where count was called was executed. The optional argument <i highlight="String">title</i> will print a message in addition to the number of the count.</dd>
			</dl>;
		},

		exception: function (error_object) {
			return <dl>
				<dt highlight="Function">console.exception(error-object[, object, ...])</dt>
				<dd>Prints an error message together with an interactive stack trace of JavaScript execution at the point where the exception occurred.</dd>
			</dl>;
		},

		table: function (data, columns) {
			return <dl>
				<dt highlight="Function">console.table(data[, columns])</dt>
				<dd>Allows to log provided data using tabular layout. The method takes one required parameter that represents table like data (array of arrays or list of objects). The other optional parameter can be used to specify columns and/or properties to be logged (see more <a href="http://www.softwareishard.com/blog/firebug/tabular-logs-in-firebug/" highlight="URL" title="Tabular logs in Firebug">here</a>).</dd>
		</dl>;
		}
	}
};

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function echoObj(obj, path) {
	var output = <></>;
	var path = arguments[1] ? arguments[1] : false;
	if (path) {
		var stack = path.split(".").filter(function(t) t);
		var first = stack.shift();
		if (!stack.length) {
			if (obj.hasOwnProperty(first)) {
				var type = capitaliseFirstLetter(typeof obj[first]);
				switch ( type ) {
					case "String" :
					return <dl>
					<dt highlight={type}>{first}</dt>
					<dd>{obj[first]}</dd>
					</dl>;
					break;

					case "Function" :
					return obj[first]();
					break;

					case "Object" :
					return output = <div style="padding:1em;">{echoObj(obj[first])}</div>;
					break;
				}
			} else
				return false;
		} else {
			return echoObj(obj[first], stack.join("."));
		}
	} else {
		var type = capitaliseFirstLetter(typeof obj);
		switch ( type ) {
			case "Object" :
			for (var prop in obj) {
				if (!obj.hasOwnProperty(prop))
					continue;
				let _output = echoObj(obj, prop);
					output += <>{_output}</>;
			}
			return <div style="padding:1em;">{output}</div>;
			break;

			default :
			return false;
			break;
		}
	}
}

function completeObj(obj, prefix) {
	var prefix = arguments[1] ? arguments[1]+"." : "";
	var completions = [];
	for (var prop in obj) {
		if (!obj.hasOwnProperty(prop))
			continue;
		var elem =obj[prop];
		var type = capitaliseFirstLetter(typeof elem);
		let path = prefix+prop;
		switch ( type ) {
			case "String" :
			completions.push([path, elem, prop, "Object"]);
			break;

			case "Function" :
			completions.push([path, elem().dd.text(), elem().dt.text(), "Function"]);
			break;

			case "Object" :
			var _completions = completeObj(elem, path);
			completions.push([path, path, prop, "Object"]);
			_completions.forEach(function (item) {
				completions.push(item);
			});
			break;

			default :
			break;
		}
	}
	return completions;
}

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
		bang: true, // TODO: :fb! invoke last call, :fb! xxx works like shell history substitution
		// completer: completion.javascript,
		completer: function(context, args) {
			if (!Firebug.currentContext) {
				Firebug.toggleBar(true, "console");
				enableCurrentPanel();
				Firebug.minimizeBar();
			}
			context.regenerate = true;
			// update(content.wrappedjsobject, G); // NB: dangerous, plz never use it
			var _context = modules.newContext(content.wrappedJSObject, false);
			var web = modules.JavaScript();
			web.newContext = function newContext() modules.newContext(_context, false);

			web.globals = [
				[G, "Command Line API"],
				[content.wrappedJSObject, "Current Page"],
			].concat(web.globals);

			if (!isPrototypeOf.call(modules.jsmodules, content.wrappedJSObject))
				web.toplevel = content.wrappedJSObject;

			if (!isPrototypeOf.call(window, content.wrappedJSObject))
				web.window = content.wrappedJSObject;

			if (web.globals.slice(2).some(function ([global]) global === content.wrappedJSObject))
				web.globals.splice(1);

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
group.options.add(
	["firebug-cite", "fbcite"],
	"Show firebug help notes.",
	"boolean",
	true,
	{

	}
);

group.commands.add(["firebug-help", "fbh"],
	"Firebug Command Line API tips!",
	function (args) {
		let output = echoObj(G, args[0] || "");
		if (output) {
			if (options["firebug-cite"]) {
				output = <>
					<style type="text/css">
					<![CDATA[
						p.code_block {
							border:1px dashed #ccc;
							padding:1em;
						}
					]]></style>
					{output}
					<h2 style="border-top:1px solid #ccc;padding-top:1em;"><a href="http://getfirebug.com/wiki/index.php/Command_Line_API" title="Command Line API" highlight="URL">Command Line API</a></h2>
					<p>The Firebug command line provides special functions for your convenience.</p>
					<h3><a href="http://getfirebug.com/wiki/index.php/Console_API" highlight="URL">Console API</a></h3>
					<p>Firebug adds a global variable named "console" to all web pages loaded in Firefox. This object contains many methods that allow you to write to the Firebug console to expose information that is flowing through your scripts.</p>
					<h4>Implementation Notes</h4>
					<p>The console is an object attached to the window object in the web page. In Firebug for Firefox the object is attached only if the Console panel is enabled. In Firebug lite, the console is attached if Lite is installed in the page.</p>
				</>;
			}
			dactyl.echo(<div style="width:800px;white-space:normal;padding:1em 2em 2em;line-height:24px;">{output}</div>, commandline.FORCE_MULTILINE);
		} else
			dactyl.echoerr("Help item doesn't exist!", commandline.FORCE_SINGLELINE);
	},
	{
		bang: true,
		completer: function(context, args) {
			context.process[1] = function(item, text) <span><b highlight={item.item[3]}>{item.item[2] + ": "}</b>{(text)}</span>;
			context.compare = null;
			context.completions = completeObj(G);
			context.filters = [
				function (item) {
					return (item.item[0].toUpperCase()).indexOf(args[0].toUpperCase()) + 1;
				}
			]
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
