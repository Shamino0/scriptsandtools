# Git scripts

Several scripts that I have found useful while developing software with `git`.
Mostly packages for fetching specific versions of files and comparing them
using Emacs.

* [gitediff](#gitediff)
* [gitediff2](#gitediff2)
* [gitediffcommit](#gitediffcommit)
* [gitediffcommit2](#gitediffcommit2)
* [gitview](#gitview)

## `gitediff`

Compare a file against some version from its `git` history, or compare two
historic versions of a file.  The two versions are loaded into GNU Emacs and an
`ediff-buffers` command is executed against the pair.

If multiple files are specified, then the first file/revisions are be compared
in Emacs.  After Emacs terminates, the next will be compared, etc.

Usage: `gitediff <file>[[#<rev>]#<rev>] [<file>[[#<rev>]#<rev>] ...]`

Where:

* `<file>` is a filename.  An absolute or relative path to a file that is under
`git` version control

* `[[#<rev>]#<rev>]` is an optional 1- or 2-term version expression:

  * If omitted, the local version of the file is compared against the current
    version on the branch or the version staged for commit (e.g. after a `git
    add` operation).
  * If only one term (`#<rev>`) is provided, the local version of the file is
    compared against the specified version provided.
  * If two terms (`#<rev>#<rev>`) are provided, then the two specified versions
    are compared against each other.
    
  * Within the version expression:
  
    * The `#` character is a literal.  It delimits between filenames and
      revisions.
    * `<rev>` represents a revision of the file:
      
      * It can be any `git` revision specifier (commit number, tag, branch
        name, HEAD expression, etc.)
      * A negative integer (e.g. `-1` or `-5`) represents a version along the
        file's commit history.  `-1` represents the most recently committed
        version.  `-2` represents the version prior to that, etc.
        
        Note that this is different from Git expressions like `HEAD~3` or
        `HEAD^3`, which specify a number of prior/parent *commits*, whether or
        not the specified file changed in every one of those commits.  This
        script's `-3` expression only counts those where the specified file
        changed.
        
Some examples may help:

* `gitediff foo.c`

  Compare `foo.c` against the most-recent version `git` knows about (current
  version on the branch or version staged for commit).  Great for checking what
  you're currently working on.
  
* `gitediff foo.c#HEAD`

  Compare `foo.c` against the `HEAD` revision.  This should be the current
  commit on the branch, whether or not there is another version staged for
  commit.
  
* `gitediff foo.c#-5`

  Compare `foo.c` against its 5th-generation prior commit (according to the
  file's `git log` history.

* `gitediff foo.c#origin/master`

  Compare `foo.c` against the version at the head of `origin/master`.
  Expressions like this are useful for comparing your local head-of-branch
  against a remote head-of-branch, to see the changes prior to a `git push`
  operation.

* `gitediff foo.c#release5branch`

  Compare `foo.c` against the version at the head of `release5branch`
  
* `gitediff foo.c#release4branch#release5branch`

  Compare the version of `foo.c` at the head of `release4branch` against the
  version at the head of `release5branch`

## `gitediff2`

Compare two arbitrary files, allowing `git` revisions to be specified for each.
The two files are loaded into GNU Emacs and an `ediff-buffers` command is
executed against the pair.

If more than two files are specified, then the first two are compared in
Emacs.  After Emacs terminates, the next two will be compared, etc.

Usage: `gitediff2 <file>[#<rev>] <file>[#<rev>] [<file>[#<rev>] <file>[#<rev>]
...]`

Where:
* `<file>` is a filename.  An absolute or relative path.  If a revision is
  specified, then the file must be under `git` version control.

* `[#<rev>]` is an optional version expression:

  * If omitted, the local version of the file is used.
  * If provided, the specified version is retrieved from `git` for the
    comparison.
    
    See [gitediff](#gitediff), above, for the `#<rev>` syntax.

## `gitediffcommit`

View all of the changes corresponding to a single `git` commit, either
comparing each file against its immediately-prior version against specified
earlier versions.  For each file in the specified commit, the two appropriate
versions are loaded into GNU Emacs and an `ediff-buffers` command is executed
against them.  After Emacs terminates, the next file is compared.

Usage: `gitediffcommit <commit_no> [<base>]`

Where:
* `<commit_no>` is a `git` commit number
* `<base>` is an optional version expression representing the base version
  against which each file belonging to the commit is compared.
  
  * If omitted, each file in the commit is compared against its immediately
    prior version.  That is, the file's diff for the commit itself.
    
  * If provided, the specified version that the file's version (at the time of
    the commit) is compared against.  The syntax is the `#<rev>` syntax, used
    by [gitediff](#gitediff), above.
    
Some examples may help:

* `gitediffcommit 1234abcd`

   Show all of the diffs belonging to commit number `1234abcd` and compare it
   against its immediately prior version.  This is effectively the same as
   viewing the diffs with a `git show` command, but using Emacs'
   `ediff-buffers` to browse the differences.
   
* `gitediffcommit 1234abcd foobie`

   Show all of the files belonging to commit number `1234abcd` and compare it
   against its content for the commit named `foobie`.

* `gitediffcommit 1234abcd HEAD`

   Show all of the files belonging to commit number `1234abcd` and compare each
   against its current version for the checked-out branch.

* `gitediffcommit 1234abcd -5`

   Show all of the files belonging to commit number `1234abcd` and compare each
   against its version 5 commits prior to the HEAD.  **IMPORTANT**: This is
   relative to the branch's head, not to the commit being viewed.

## `gitediffcommit2`

View all of the changes between two `git` commits.  For each file that differs,
load the two versions into GNU Emacs and use `ediff-commit` to compare them.
After Emacs terminates, the next file is compared.

Usage: `gitediffcommit2 <commit1> [<commit2>]`

Where:

* `<commit1>` is a `git` commit number

* `<commit2>` is an optional second `git` commit number.  If present, the
  differences between the two commits is compared.  If not provided, then the
  specified commit is compared against the local version of each file.

## `gitview`

View an arbitrary files, allowing a `git` revision to be specified.  The file
is loaded into GNU Emacs

If more than one files is specified, then the first is loaded into Emacs.
After Emacs terminates, the next is loaded, etc.

Usage: `gitview <file>[#<rev>] [<file>[#<rev>] ...]`

Where:
* `<file>` is a filename.  An absolute or relative path.  If a revision is
  specified, then the file must be under `git` version control.

* `[#<rev>]` is an optional version expression:

  * If omitted, the local version of the file is used.
  * If provided, the specified version is retrieved from `git` for the
    comparison.
    
    See [gitediff](#gitediff), above, for the `#<rev>` syntax.
