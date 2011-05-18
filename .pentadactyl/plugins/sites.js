// sites.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Wed 18 May 2011 12:21:51 PM CST
// @Last Change: Wed 18 May 2011 01:13:50 PM CST
// @Revision:    43
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

// 修复百度贴吧无法中键打开链接，狗日的百度
// http://www.czcp.co.cc/archives/193
let FixMiddleClick = {
	handleEvent: function (e) {
		if (!e.target || e.target.localName != "a" || e.button != 1
			|| e.target.href == "") return;
		e.preventDefault();
		dactyl.open(e.target.href, {background:true, where:dactyl.NEW_TAB});
	},
	init: function () {
		content.document.removeEventListener("click", FixMiddleClick, false);
		content.document.addEventListener("click", FixMiddleClick, false);

		content.document.addEventListener("unload", function (e) {
				content.document.removeEventListener("click", FixMiddleClick, false);
				content.document.removeEventListener("unload", arguments.callee, false);
			}, false);
	}
};
group.autocmd.add(["LocationChange"], "http://tieba.baidu.com/f?*", function () {
		FixMiddleClick.init();
});

