// tabs-on-statusline.js -- put tabstoolbar on pentadactyl statusline
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Sun 23 Oct 2011 01:04:54 PM CST
// @Last Change: Sun 23 Oct 2011 03:16:49 PM CST
// @Revision:    44
// @Description:
// @Usage:
// @TODO:
// @CHANGES:
// @Readme:     recommend settings: set showtabline=always

let TOS = {
	init: function() {
		TOS.widget = document.getElementById("TabsToolbar");
		TOS.tabsToolbar_parent = TOS.widget.parentNode;
		TOS.tabsToolbar_prev = TOS.widget.previousSibling;
		TOS.tabsToolbar_next = TOS.widget.nextSibling;
	},
	setup: function() {
		statusline.widgets.url.parentNode.insertBefore(TOS.widget, statusline.widgets.url.nextSibling);
	},
	restore: function() {
		if (TOS.tabsToolbar_prev)
			return TOS.tabsToolbar_parent.insertBefore(TOS.widget, TOS.tabsToolbar_prev.nextSibling);
		if (TOS.tabsToolbar_next)
			return TOS.tabsToolbar_parent.insertBefore(TOS.widget, TOS.tabsToolbar_next);
		return TOS.tabsToolbar_parent.appendChild(TOS.widget);
	}
};
TOS.init();

highlight.loadCSS(<![CDATA[
			StatusCmdLine {-moz-box-align:center;}
			StatusCmdLine>#TabsToolbar {background-color:transparent !important;background-image:none !important;-moz-appearance:none !important;}
			'StatusLineBroken [dactyl|highlight*="Status"]' {background-color:transparent !important;color:#313633 !important;}
			'StatusLineExtended [dactyl|highlight*="Status"]' {background-color:transparent !important;color:#313633 !important;}
			'StatusLineSecure [dactyl|highlight*="Status"]' {background-color:transparent !important;color:#313633 !important;}
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
			}
			return value;
        }
    }
);

TOS.setup();
