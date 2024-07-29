# P4 scripts

Several scripts that I have found useful (in the ever-increasingly distant
past) while developing software with Perforce.  Mostly packages for fetching
specific versions of files and comparing them using Emacs.

* [p4ediff](#p4ediff)
* [p4ediff3](#p4ediff3)
* [p4emacs](#p4emacs)
* [p4lastchange](#p4lastchange)
* [p4lastchange_thisdir](#p4lastchange_thisdir)

## `p4ediff`

Compare a file against some version from its Perforce history, or compare two
historic versions of a file.  The two versions are loaded into GNU Emacs and an
`ediff-buffers` command is executed against the pair.

If multiple files are specified, then the first file/revisions are be compared
in Emacs.  After Emacs terminates, the next will be compared, etc.

Usage: `p4ediff <file>[[#<rev>]#<rev>] [<file>[[#<rev>]#<rev>] ...]`

Where:

* `<file>` is a filename.  An absolute or relative path to a file that is under
  Perforce version control

* `[[#<rev>]#<rev>]` is an optional 1- or 2-term version expression:

  * If omitted, the local version of the file is compared against the most
    recent version in Perforce.
  * If only one term (`#<rev>`) is provided, the local version of the file is
    compared against the specified version provided.
  * If two terms (`#<rev>#<rev>`) are provided, then the two specified versions
    are compared against each other.
    
  * Within the version expression:
  
    * The `#` character is a literal.  It delimits between filenames and
      revisions.
    * `<rev>` represents a revision of the file.  An integer representing a
      version number on the current branch.

## `p4ediff3`

Perform a 3-way diff against a local file and two revisions from its Perforce
history, or compare two historic versions of a file.  The three versions are
loaded into GNU Emacs and an `ediff-files3` command is executed against them.

If multiple files are specified, then the first file/revisions are be compared
in Emacs.  After Emacs terminates, the next will be compared, etc.

Usage: `p4ediff3 <file>#<rev>#<rev> [<file>#<rev>#<rev> ...]`

Where:

* `<file>` is a filename.  An absolute or relative path to a file that is under
  Perforce version control

* `<rev>` represents a revision of the file.  An integer representing a version
  number on the current branch.

## `p4emacs`

Check out one or more files from Perforce and load them into GNU Emacs for
editing.

Usage: `p4emacs <file> [<file> ...]`

## `p4lastchange`

Get information about the last change committed to the current Perforce code
depot.

## `p4lastchange_thisdir`

Get information about the last change committed to the current Perforce code
depot for the current directory only.
