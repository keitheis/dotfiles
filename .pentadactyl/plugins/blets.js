// blets.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Mon 19 Mar 2012 01:41:16 AM CST
// @Last Change: Mon 19 Mar 2012 09:00:05 PM CST
// @Revision:    153
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
            dactyl.echomsg('Finish rebuilt bookmarklets index');
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
                dactyl.echoerr('missing url');
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
        } else if (args['-f'] || args['--file']) {
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
                            let encode = encodeURI('javascript:' + code);
                            dactyl.clipboardWrite(encode, true);
                    });
                } else {
                    dactyl.echoerr('文件不可读或者是错误');
                }
            } catch (e) {
                dactyl.echoerr('打开文件失败!');
            } finally {

            }
        } else {
            if (args.length == 0) {
                dactyl.echoerr('Missing keyword');
                return false;
            }
            let keyword = args[0];
            let item = bookmarkcache.keywords[keyword];
            if (item) {
                dactyl.open(item.url);
            } else {
                dactyl.open(encodeURI('javascript:' + keyword));
            }
        }
    },
    {
        argCount: '?',
        bang: true,
        completer: function(context, args) {
            if (args.bang ||
               args['-e'] || args['--encode']
            ) {
                return false;
            }

            if (args['-f'] || args['--file']) {
                completion.file(context, true);
                return true;
            }

            context.completions = blets;
            context.format = bookmarks.format;
            context.regenerate = true;
            if (args['-d'] || args['--decode']) {
                context.keys.text = function(item) item.uri.spec;
            } else {
                context.keys.text = function(item) item.keyword || decodeURIComponent(item.uri.path);
            }
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
                names: ['-f', '--file'],
                description: '从 javascript 源代码文件，生成 bookmarklet',
                type: CommandOption.NOARG
            }
        ],
        literal: 0
    },
    true
);
