# IETF scripts

Two scripts that work together for keeping a local mirror of the IETF RFCs,
drafts and related documents.  Also converts the corresponding index files into
HTML with links to the docs (suitable for serving by a local web server).

This is probably not necessary, since the IETF (today) provides a great web
interface, but I've been maintaining a mirror for over 20 years and I don't
want to stop now.

Usage: `get-drafts`

## Configuration

### Global

Edit the variable `IETF_ROOT` to point to the root of your local mirror.  The
default is `$HOME/public_html/standards/ietf`, which is my personal local web
server's location.

### RFCs

RFCs are downloaded to the directory indicated by the `RFC_ROOT` variable.  By
default, this is `$IETF_ROOT/rfcs`.

### Drafts

Drafts are downloaded to the directory indicated by the `DRAFT_ROOT` variable.
By default, this is `IETF_ROOT/drafts`.

The following variables are used internally for specifying locations where
drafts are stored:

Variable               | Value                   | Description
:--------------------- | :---------------------- | :-------------------------
`DRAFTS_DIR`           | `$DRAFT_ROOT/drafts`    | Current drafts 
`DRAFTS_ARCHIVE`       | `$DRAFT_ROOT/Archive`   | Archive (see below)
`DRAFTS_ARCHIVE_IETF`  | `$DRAFTS_ARCHIVE/ietf`  | Archive for IETF WG drafts
`DRAFTS_ARCHIVE_NAMED` | `$DRAFTS_ARCHIVE/named` | Archive for non-WG drafts

## Summary of operation

1. The entire RFC archive is synchronized from the IETF using `rsync`.

2. The `rfc_index_to_html` script is used to generate HTML versions of the text
   files containing the BCP, FYI, IEN, RFC and STD indices.
   
3. Symlinks are created so the original index files will appear at the top of
   directory listings.
   
4. All drafts are synchronized to an "archive" directory, preserving anything
   that was deleted.  This is is in order to preserve any expired drafts.
   
   Due to the fact that some file systems (e.g. old Solaris distributions) get
   very slow processing directories that have tens of thousands of files (as is
   the case here), the archive directory is further subdivided into a directory
   for IETF drafts and named drafts.
   
   IETF drafts are all drafts from IETF working groups.  These all have names
   that start with `draft-ietf-`.  Named drafts are those that have not been
   accepted by IETF working groups, and begin with `draft-name-` where `name`
   is anything other than `ietf`.
   
5. All drafts are synchronized from the IETF.

6. Then the drafts are backed-up to the archive a second time.  The purpose is
   so the archive will include the latest changes.  (The backup done before
   synchronizing from the IETF is so expired drafts will be preserved.)
   
7. The `draft_index_to_html` script is used to generate an HTML version of the
   draft index text file.

## Internal script - `rfc_index_to_html`

This script is used internally to generate HTML versions of the IETF index text
files for BSP, FYI, IEN, RFC and STDs

Usage: `rfc_index_to_html [-bfirs] infile outfile`

Where:

* -b means parse a BCP index
* -f means parse an FYI index
* -i means parse an IEN index
* -r means parse an RFC index (default)
* -s means parse an STD index
* infile is the input file.  If omitted, standard input is used
* outfile is the output file.  If omitted, standard output is used

### Summary of operation

1. Parse command-line arguments, setting up local variables as required

2. Open the input and output files

3. Output the HTML header lines

4. Loop across the input file, copying everything to the output file until we
   locate the "key string" (e.g. `RFC INDEX`) representing the start of data we
   care about.
   
   Characters interpreted by HTML (`<`, `>` and `&`) are converted to their
   HTML equivalents (`&lt;`, `&gt;` and `&amp;`, respectively).
   
5. Continue looping across the input file, copying everything to the output
   file (converting HTML characters as needed), looking for lines that begin
   with a number - these are document numbers and the line indicates the start
   of a document description.
   
   * While parsing a document, look for format tags text of the form `(Format:
     ...)`.  These indicate the format(s) for the document (e.g. HTML, text,
     PDF, etc.)
   
   * Whenever a blank line is encountered, this is the end of a document.
     Output HTML containing links to the document in its available formats and
     a link to the IETF web site's copy of the document
   
6. When the end of the file is reached, output HTML footer lines

## Internal script - `draft_index_to_html`

This script is used internally to generate an HTML version of the IETF draft text
file.

Usage: `draft_index_to_html infile outfile`

Where:

* infile is the input file.  If omitted, standard input is used
* outfile is the output file.  If omitted, standard output is used

### Summary of operation

1. Open the input and output files

2. Output the HTML header lines

3. Loop across the input file, copying everything to the output file
   (converting HTML characters as needed), looking for lines that include the
   name of a draft document.  These are lines containing text of the form
   `<draft-...>`.  The script assumes that these lines appear at the end of
   each document's description.
   
   When a document's name is found:
   
   * Extract the document suffix (file type) from each file name
   
   * Output HTML containing links to the document and a link to the IETF web
     site's copy of the document.
   
4. When the end of the file is reached, output HTML footer lines
