" jshint.vim -- vim
" @Author:      eric.zou (mailto:frederick.zou@gmail.com)
" @Website:     https://github.com/grassofhust
" @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
" @Created:     Fri 18 Mar 2011 02:26:29 AM CST
" @Last Change: Sun 22 Jan 2012 07:29:59 PM CST
" @Revision:    0.43
" @Description: JShint - javascript lint built on node.js

if exists("current_compiler")
	finish
endif
let current_compiler = "jshint"

if !exists('g:jshint')
	let g:jshint_executable = 'jshint'
endif

if exists(":CompilerSet") != 2
command -nargs=* CompilerSet setlocal <args>
endif

CompilerSet errorformat=%f:\ line\ %l\\,\ col\ %c\\,\ %m,
						\%-G%.%#
" foobar.js: line 1, col 1, Expected an identifier and instead saw 'let'.
CompilerSet makeprg=jshint\ \"%\"


