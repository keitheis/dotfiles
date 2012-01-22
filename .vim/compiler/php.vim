" php.vim -- vim
" @Author:      eric.zou (mailto:frederick.zou@gmail.com)
" @Website:     http://www.linux-ren.org/
" @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
" @Created:     Fri 18 Mar 2011 02:26:29 AM CST
" @Last Change: Sun 22 Jan 2012 07:36:03 PM CST
" @Revision:    0.37
" @Description: php.vim - php code check

if exists("current_compiler")
	finish
endif
let current_compiler = "php"

if !exists('g:phplint_executable')
	let g:phplint_executable = 'php'
endif


if exists(":CompilerSet") != 2
	command -nargs=* CompilerSet setlocal <args>
endif
CompilerSet errorformat=%EPHP\ Parse\ error\:\ \ syntax\ error\\,\ %m\ in\ %f\ on\ line\ %l,
						\%-G%.%#
CompilerSet makeprg=php\ -l\ \"%\"
" CompilerSet makeprg=sed\ '/$/d'<<<$(php\ -l\ %)

" PHP Parse error:  syntax error, unexpected T_OBJECT_OPERATOR, expecting ')' in /tmp/a.php on line 8
" Errors parsing /tmp/a.php
" 
