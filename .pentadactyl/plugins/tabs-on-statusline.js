// tabs-on-statusline.js -- put tabstoolbar on pentadactyl statusline
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Sun 23 Oct 2011 01:04:54 PM CST
// @Last Change: Sun 23 Oct 2011 06:30:35 PM CST
// @Revision:    92
// @Description:
// @Usage:
// @TODO:
// @CHANGES:
// @Readme:     recommend settings: set showtabline=always

let TOS = {
	init: function() {
		TOS.tabsToolbar = document.getElementById("TabsToolbar");
		TOS.tabsToolbar_parent = TOS.tabsToolbar.parentNode;
		TOS.tabsToolbar_prev = TOS.tabsToolbar.previousSibling;
		TOS.tabsToolbar_next = TOS.tabsToolbar.nextSibling;
		TOS.widget = document.getElementById('dactyl-statusline-field-tos');
		if (!TOS.widget) {
			TOS.widget = util.xmlToDom(
				<toolbox xmlns={XUL} highlight="TOS" id="dactyl-statusline-field-tos" align="stretch"/>,
				document);
		}
		statusline.widgets.url.parentNode.insertBefore(TOS.widget, statusline.widgets.url.nextSibling);
		commandline.widgets.addElement({
				name: "tos",
				getGroup: function () this.statusbar,
				getValue: function () statusline.visible && options["tabs-on-statusline"] && (options["showtabline"] !== "never"),
				noValue: true
		});
	},
	setup: function() {
		TOS.widget.appendChild(TOS.tabsToolbar);
	},
	restore: function() {
		if (TOS.tabsToolbar_prev)
			return TOS.tabsToolbar_parent.insertBefore(TOS.tabsToolbar, TOS.tabsToolbar_prev.nextSibling);
		if (TOS.tabsToolbar_next)
			return TOS.tabsToolbar_parent.insertBefore(TOS.tabsToolbar, TOS.tabsToolbar_next);
		return TOS.tabsToolbar_parent.appendChild(TOS.tabsToolbar);
	}
};
TOS.init();

highlight.loadCSS(<![CDATA[
			StatusCmdLine {-moz-box-align:center;}
			StatusCmdLine>#TabsToolbar {background-color:transparent !important;background-image:none !important;-moz-appearance:none !important;}
			StatusLineBroken [dactyl|highlight*="Status"] {background-color:transparent;color:#313633;}
			StatusLineExtended [dactyl|highlight*="Status"] {background-color:transparent;color:#313633;}
			StatusLineSecure [dactyl|highlight*="Status"] {background-color:transparent;color:#313633;}
]]>, true);

// Options
group.options.add(["tabs-on-statusline", "tos"],
    "Put tabstoolbar on pentadactyl statusline! ",
    "boolean",
    true,
    {
        setter: function (value) {
			if (this.hasChanged && (options["tabs-on-statusline"] !== value)) {
				if (value) {
					TOS.setup();
				} else {
					TOS.restore();
				}
				tabs.updateTabCount()
			}
			return value;
        }
    }
);

if (options["tabs-on-statusline"]) {
	TOS.setup();
	tabs.updateTabCount()
}

function onUnload() { // :rehash, exit firefox/current window, disable pentadactyl extension
	TOS.restore();
}
