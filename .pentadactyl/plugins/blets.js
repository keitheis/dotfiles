// blets.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Mon 19 Mar 2012 01:41:16 AM CST
// @Last Change: Mon 19 Mar 2012 03:23:18 AM CST
// @Revision:    78
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

let blets = bookmarks.get('javascript:');
group.commands.add(['blets'],
    '快速加载 bookmarklets',
    function(args) {
        if (args.bang) {
            blets = bookmarks.get('javascript:');
            dactyl.echomsg('rebuilt bookmarklets index');
        } else {
            if (args.length == 0) {
                dactyl.echoerr('missing keyword');
                return false;
            }
            let keyword = args[0];
            let item = bookmarkcache.keywords[keyword];
            if (item) {
                dactyl.open(item.url);
            } else {
                dactyl.open(encodeURI('javascript:'+keyword));
            }
        }
    },
    {
        argCount: '?',
        bang: true,
        completer: function(context, args) {
            context.completions = blets;
            context.format = bookmarks.format;
            context.keys.text = function(item) item.keyword || decodeURIComponent(item.uri.path);
            context.keys.description = function(item)
                item.keyword ? item.title + ' | ' + decodeURIComponent(item.uri.path) : item.title;
            context.process[0] = function(item) <>{item.text}</>;
            context.filters = [CompletionContext.Filter.textDescription];
        },
        literal: 0
    },
    true
);

