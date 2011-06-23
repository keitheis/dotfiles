// sites.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Wed 18 May 2011 12:21:51 PM CST
// @Last Change: Thu 23 Jun 2011 12:26:42 PM CST
// @Revision:    120
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

// 修复百度贴吧无法中键打开链接，狗日的百度
// http://www.czcp.co.cc/archives/229
let Fixcontenteditable = function (doc) {
	var richObj = doc.evaluate('//*[@contenteditable]', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	for (var i = richObj.snapshotLength - 1; i >= 0; i--) {
		var thisObje = richObj.snapshotItem(i);
		thisObje.addEventListener("blur", function (e) {
				e.currentTarget.setAttribute("originalcontenteditable", e.currentTarget.getAttribute("contenteditable"));
				e.currentTarget.removeAttribute("contenteditable");
			}, false);
		["focus", "click"].forEach(function(evt) {
				thisObje.addEventListener(evt, function (e) {
						if (e.currentTarget.hasAttribute("originalcontenteditable")) {
							e.currentTarget.setAttribute("contenteditable", e.currentTarget.getAttribute("originalcontenteditable"));
							e.currentTarget.removeAttribute("originalcontenteditable");
						}
						e.currentTarget.click();
					}, false);
		});
		if (typeof thisObje.selectionStart === "undefined") {
			thisObje.setAttribute("originalcontenteditable", thisObje.getAttribute("contenteditable"));
			thisObje.removeAttribute("contenteditable");
		}
	}

};
group.autocmd.add(["DOMLoad"], "http://tieba.baidu.com/f?*,g.mozest.com", function () {
		let doc = arguments[0].doc.valueOf();
		Fixcontenteditable(doc);
});
