// blets.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Mon 19 Mar 2012 01:41:16 AM CST
// @Last Change: Mon 19 Mar 2012 11:31:14 PM CST
// @Revision:    169
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

let blets = bookmarks.get('javascript:');
group.commands.add(['blets'],
    'All about your bookmarklets',
    function(args) {
        if (args.bang) {
            blets = bookmarks.get('javascript:');
            dactyl.echomsg('Finish rebuilding of bookmarklets index');
        } else if (args['-e'] || args['--encode']) {
            if (args.length == 0) {
                dactyl.echoerr('Missing javascript code');
                return false;
            }
            let code = args[0];
            let encode = encodeURI('javascript:' + code);
            dactyl.clipboardWrite(encode, true);
        } else if (args['-d'] || args['--decode']) {
            if (args.length == 0) {
                dactyl.echoerr('Missing bookmarklet url');
                return false;
            }
            let url = args[0];
            let uri = util.createURI(url);
            if (uri.scheme !== 'javascript') {
                dactyl.echo('Unknown protocol, your code should begin with \'javascript:\'');
                return false;
            }
            let code = decodeURIComponent(uri.path);
            dactyl.clipboardWrite(code, true);
        } else if (args['-f'] || args['--file'] || args['-l'] || args['--load']) {
            try {
                if (args.length == 0) {
                    var nsIFilePicker = Components.interfaces.nsIFilePicker;
                    var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
                    fp.init(window, 'Select a File', nsIFilePicker.modeOpen);
                    fp.appendFilter('JS Files','*.js');
                    fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
                    var res = fp.show();
                    if (res != nsIFilePicker.returnCancel) {
                        var localFile = fp.file;
                    } else {
                        return false;
                    }
                } else {
                    var filename = args[0];
                    if (!File.isAbsolutePath(filename))
                        filename = io.cwd.path + File.PATH_SEP + filename;
                    filename = File.expandPath(filename);
                    var localFile = Components.classes['@mozilla.org/file/local;1']
                        .createInstance(Components.interfaces.nsILocalFile);
                    localFile.initWithPath(filename);
                }
                if (localFile.isFile() && localFile.isReadable()) {

                    NetUtil.asyncFetch(localFile, function(inputStream, status) {
                            if (!Components.isSuccessCode(status)) {
                                // Handle error!
                                return;
                            }

                            let code = NetUtil.readInputStreamToString(inputStream, inputStream.available());
                            if (args['-f'] || args['--file']) {
                                let encode = encodeURI('javascript:' + code);
                                dactyl.clipboardWrite(encode, true);
                            } else {
                                dactyl.open(encodeURI('javascript:' + code), {where: dactyl.CURRENT_TAB});
                                dactyl.echomsg(localFile.path + ' 已以 bookmarklet 形式加载！');
                            }
                    });
                } else {
                    dactyl.echoerr('文件不可读或者是错误');
                }
            } catch (e) {
                dactyl.echoerr('打开文件失败!');
            } finally {

            }
        } else if (args['-o'] || args['--open']) {
            if (args.length == 0) {
                dactyl.echoerr('Missing bookmarklet url');
                return false;
            }
            let url = args[0];
            let uri = util.createURI(url);
            if (uri.scheme !== 'javascript') {
                dactyl.echo('Unknown protocol, your code should begin with \'javascript:\'');
                return false;
            }
            dactyl.open(url, {where: dactyl.CURRENT_TAB});
            dactyl.echomsg('指定 bookmarklet 已在当前标签页加载！');
        } else {
            if (args.length == 0) {
                dactyl.echoerr('Missing keyword');
                return false;
            }
            let keyword = args[0];
            let item = bookmarkcache.keywords[keyword];
            if (item) {
                dactyl.open(item.url, {where: dactyl.CURRENT_TAB});
                dactyl.echomsg('关键字已在当前标签页加载！');
            } else {
                let code = keyword
                dactyl.open(encodeURI('javascript:' + code), {where: dactyl.CURRENT_TAB});
                dactyl.echomsg('指定代码已以 bookmarklet 形式在当前标签页加载！');
            }
        }
    },
    {
        argCount: '?',
        bang: true,
        completer: function(context, args) {
            if (args.bang ||
                args['-e'] || args['--encode'] ||
                args['-d'] || args['--decode'] ||
                args['-o'] || args['--open']
            ) {
                return false;
            }

            if (args['-f'] || args['--file'] || args['-l'] || args['--load']) {
                completion.file(context, true);
                return true;
            }

            context.completions = blets;
            context.format = bookmarks.format;
            context.regenerate = true;
            context.keys.text = function(item) item.keyword || decodeURIComponent(item.uri.path);
            context.keys.description = function(item)
                item.keyword ? item.title + ' | ' + decodeURIComponent(item.uri.path) : item.title;
            context.process[0] = function(item) <>{item.text}</>;
            context.filters = [CompletionContext.Filter.textDescription];
        },
        options: [
            {
                names: ['-e', '--encode'],
                description: '从 javascript 代码，生成 bookmarklet',
                type: CommandOption.NOARG
            },
            {
                names: ['-d', '--decode'],
                description: '从 bookmarklet 链接，输出 javascript 代码',
                type: CommandOption.NOARG
            },
            {
                names: ['-o', '--open'],
                description: '打开 bookmarklet 链接',
                type: CommandOption.NOARG
            },
            {
                names: ['-f', '--file'],
                description: '从 javascript 源代码文件，生成 bookmarklet',
                type: CommandOption.NOARG
            },
            {
                names: ['-l', '--load'],
                description: '直接以 bookmarklet 形式加载 javascript 源代码文件',
                type: CommandOption.NOARG
            }
        ],
        literal: 0
    },
    true
);
