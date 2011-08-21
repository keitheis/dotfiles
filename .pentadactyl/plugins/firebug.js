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
		Firebug.CommandLine.toggleMultiLine();
		Firebug.CommandLine.focus(Firebug.currentContext);
	}
);

group.mappings.add(
	[modes.MAIN],
	mappingKey('i'),
	"Inspect Element",
	function() {
		Firebug.showBar(false);
		if (!hints.modes["Q"]) {
			hints.addMode("Q", "Inspect Element", function(elem) {
					Firebug.Inspector.startInspecting(Firebug.currentContext);
					Firebug.Inspector.inspectNode(elem);
					Firebug.Inspector.stopInspecting(false, true);
					Firebug.showBar(true);
					Firebug.chrome.selectPanel("html");
					elem.scrollIntoView();
			}, null, ["*"]);
		}
		modes.push(modes.NORMAL);
		events.feedkeys(";", true, true, modes.NORMAL);
		events.feedkeys("Q", true, true);
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

group.mappings.add(
	[modes.NORMAL],
	mappingKey('q'),
	"Toggle QuickInfoBar",
	function() {
		if (!Firebug.currentContext)
			Firebug.toggleBar(true);
		Firebug.Inspector.toggleInspecting(Firebug.currentContext);
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
		let cl = Firebug.CommandLine;
		let context = Firebug.currentContext;
		Firebug.toggleBar(true, "console");
		cl.enter(context, code);
	},
	{
		bang: true,
		completer: completion.javascript,
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

// Command Line API
// http://getfirebug.com/wiki/index.php/Command_Line_API
let console = function() { // TODO
	this.$ = function(id) {
		return "Returns a single element with the given id.";
	};
	this.$$ = function(selector) {
		return "Returns an array of elements that match the given CSS selector.";
	};
	this.$x = function(xpath) {
		return "Returns an array of elements that match the given XPath expression.";
	};
	this.$0 = "The currently-selected object in the inspector.";
	this.$1 = "The previously-selected object in the inspector.";
	this.$n = function(index) {
		return "Access to an array of last 5 inspected elements.";
	};
	this.dir = function(object) {
		return "Prints an interactive listing of all properties of the object. This looks identical to the view that you would see in the DOM tab.";
	};
	this.dirxml = function(node) {
		return "Prints the XML source tree of an HTML or XML element. This looks identical to the view that you would see in the HTML tab. You can click on any node to inspect it in the HTML tab.";
	};
	this.cd = function(window) {
		return "By default, command line expressions are relative to the top-level window of the page. cd() allows you to use the window of a frame in the page instead.";
	};
	this.clear = function() {
		return "Clears the console.";
	};
	this.inspect = function(object/*[, tabName]*/) {
		return "Inspects an object in the most suitable tab, or the tab identified by the optional argument tabName.";
	};
};
