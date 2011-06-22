// sites.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Wed 18 May 2011 12:21:51 PM CST
// @Last Change: Wed 22 Jun 2011 11:54:26 PM CST
// @Revision:    108
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

// 修复百度贴吧无法中键打开链接，狗日的百度
// http://www.czcp.co.cc/archives/229
let Fixcontenteditable = function (doc) {
	var richObj = doc.evaluate('//*[@contenteditable]', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	for ( var i=0 ; i < richObj.snapshotLength; i++ ) {
		var thisObje = richObj.snapshotItem(i);
		thisObje.addEventListener("blur", function (e) {
				e.currentTarget.setAttribute("originalcontenteditable", e.currentTarget.getAttribute("contenteditable"));
				e.currentTarget.removeAttribute("contenteditable");
			}, false);
		["focus", "click"].forEach(function(evt) {
				thisObje.addEventListener(evt, function (e) {
						e.currentTarget.setAttribute("contenteditable", e.currentTarget.getAttribute("originalcontenteditable"));
						e.currentTarget.removeAttribute("originalcontenteditable");
						e.currentTarget.click();
					}, false);
		});
		thisObje.setAttribute("originalcontenteditable", thisObje.getAttribute("contenteditable"));
		thisObje.removeAttribute("contenteditable");
	}

}
group.autocmd.add(["DOMLoad"], "http://tieba.baidu.com/f?*", function () {
		let doc = arguments[0].doc.valueOf();
		Fixcontenteditable(doc);
});
