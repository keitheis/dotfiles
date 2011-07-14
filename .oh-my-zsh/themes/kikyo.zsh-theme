# Check the UID
if [[ $UID -ge 1000 ]]; then # normal user
    eval PR_USER='${fg[grren]}%n${reset_color}'
    eval PR_USER_OP='${fg[green]}%#${reset_color}'
elif [[ $UID -eq 0 ]]; then # root
    eval PR_USER='${fg[red]}%n${reset_color}'
    eval PR_USER_OP='${fg[red]}%#${reset_color}'
fi

# Check if we are on SSH or not
if [[ -n "$SSH_CLIENT" || -n "$SSH2_CLIENT" ]]; then
    eval PR_HOST='${fg[yellow]}%M${reset_color}' #SSH
else
    eval PR_HOST='${fg[green]}%M${reset_color}' # no SSH
fi

local return_status="%(?,, [%?])"

PROMPT="%{$fg[white]%}%n@%M %{$reset_color%}"
PROMPT+="${fg[red]}%~${fg[default]}"
PROMPT+='${return_status}'
PROMPT+=$'%{$fg[red]%} %{$(git_prompt_info)%}'
PROMPT+='$(git_prompt_status)%{$reset_color%}'
PROMPT+=$'
%{$fg[red]%}^_^%{$reset_color%} '
PS2=$' %{$fg[red]%}|>%{$reset_color%} '

ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg[cyan]%}[%{$fg[white]%}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$reset_color%}%{$fg[cyan]%}] "
ZSH_THEME_GIT_PROMPT_DIRTY=" %{$fg[green]%}!%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_CLEAN=""


ZSH_THEME_GIT_PROMPT_ADDED="%{$fg[green]%}ADDED"
ZSH_THEME_GIT_PROMPT_MODIFIED="%{$fg[green]%}MODIFIED"
ZSH_THEME_GIT_PROMPT_DELETED="%{$fg[green]%}DELETED"
ZSH_THEME_GIT_PROMPT_RENAMED="%{$fg[green]%}RENAMED"
ZSH_THEME_GIT_PROMPT_UNMERGED="%{$fg[green]%}UNMERGED"
ZSH_THEME_GIT_PROMPT_UNTRACKED="%{$fg[green]%}UNTRACKED"

