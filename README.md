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

## C tools

Some simple tools written in C.  Including a Makefile to compile them

[C tools](c_tools/README.md)

## IETF scripts

Two scripts that work together for keeping a local mirror of the IETF RFCs,
drafts and related documents.  Also converts the corresponding index files into
HTML with links to the docs (suitable for serving by a local web server).

This is probably not necessary, since the IETF provides a great web interface,
but I've been maintaining this archive for over 20 years and I don't want to
stop now.

[IETF scripts](ietf/README.md)

## P4 scripts

Several scripts that I have found useful (in the every-increasingly distant
past) while developing software with Perforce.  Mostly packages for fetching
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

## Vacation calendar generator

A JavaScript library for generating a calendar that tracks used and remaining
paid time-off based on a list of provided dates.

[Vacation calendar](vacation_calendar/README.md)
