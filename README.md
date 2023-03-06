# scriptsandtools
A bunch of assorted scripts and tools I've developed over the years

The smaller scripts will be documented here and in in-file comments.  More
complicated ones will have separate documentation files.

## `apt_update`

A quick two-line shell script for use with Debian-like Linux distributions.
Calls `sudo apt update` followed by `sudo apt upgrade`.

## Git scripts

Several scripts that I have found useful while developing software with `git`.
Mostly packages for fetching specific versions of files and comparing them
using Emacs.

[Git scripts](git/README.md)

## P4 scripts

Several scripts that I have found useful (in the every-increasingly distant
past) while developing softare with Perforce.  Mostly packages for fetching
specific versions of files and comparing them using Emacs.

Most of my Git scripts evolved from these scripts

[P4 scripts](p4/README.md)

## `supersplice`

A useful, if somewhat dangerous script.  Applies `sed` search-and-replace
regular expression to multiple files.

Usage: `supersplice <regex> file [file...]`

This script does not make any backup copies of anything, so it can cause
permanent damage if you make a mistake.

I recommend only using this script on files that are managed under a version
control system (e.g. git) and only use it after preserving the prior versions
(e.g. with a `git add` command), so you can undo any possible mistakes.
