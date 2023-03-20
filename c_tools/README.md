# C tools

Some simple utilities I've written in C, including a Makefile for compiling
them.

* [dumpfloat](#dumpfloat)

## `dumpfloat`

Encode and decode IEEE format floating point numbers.  Input numbers may be
decimal or a hexadecimal string representing the in-memory representation.
This utility is very useful for debugging applications where floating point
values may appear in a hexadecimal memory dump.

Usage: `dumpfloat [-hex]|[-dec] [-single]|[-double] [-debug] <value>`

Where:

* Input format
  * `-hex` specifies that `<value>` is a hexadecimal string
  * `-dec` specified that `<value>` is a decimal string
  * If neither is specified, then the application will parse `<value>` as a
    decimal string if it has a decimal point and as hexadecimal if it does not.
    
* Output format
  * `-single` will parse a hexadecimal string as single-precision (32-bit).
    Only single-precision data will be output.
  * `-double` will parse a hexadecimal string as double-precision (64-bit).
    Only double-precision data will be output.
  * If neither are specified, hexadecimal values will be parsed as double
    precision (with the first four bytes also being parsed as single
    precision).  Both single- and double-precision data will be output.

* `-debug` requests detailed information about how the input value's bytes are
  broken down into their respective floating point parameters (sign, exponent
  and mantissa), including a dump of the C compiler's constants affecting
  floating point behavior.
  
This implementation assumes that the host CPU architecture uses IEEE format
floating point numbers.  If run on a host with a different floating point
representation, the output will be undefined.

### Examples

~~~~
$ dumpfloat 1.2345
0x(3f 9e 04 19) (s=0 e=0 m=1.23450005054473876953) (1.2345000505447387695)
0x(3f f3 c0 83 12 6e 97 8d) (s=0 e=0 m=1.23449999999999993072) (1.2344999999999999307)

$ dumpfloat -single 3f930419
0x(3f 93 04 19) (s=0 e=0 m=1.14856255054473876953) (1.1485625505447387695)

$ dumpfloat -double 3ff3c083126e97ad
0x(3f f3 c0 83 12 6e 97 ad) (s=0 e=0 m=1.23450000000000703615) (1.2345000000000070361)

$ dumpfloat -debug 1.2345
breakdown of mantissa for 1.234500051
     2^  0 = 1.00000000000000000000
     2^ -3 = 0.12500000000000000000
     2^ -4 = 0.06250000000000000000
     2^ -5 = 0.03125000000000000000
     2^ -6 = 0.01562500000000000000
     2^-13 = 0.00012207031250000000
     2^-19 = 0.00000190734863281250
     2^-20 = 0.00000095367431640625
     2^-23 = 0.00000011920928955078
0x(3f 9e 04 19) (s=0 e=0 m=1.23450005054473876953) (1.2345000505447387695)
breakdown of mantissa for 1.2344999999999999307
     2^  0 = 1.00000000000000000000
     2^ -3 = 0.12500000000000000000
     2^ -4 = 0.06250000000000000000
     2^ -5 = 0.03125000000000000000
     2^ -6 = 0.01562500000000000000
     2^-13 = 0.00012207031250000000
     2^-19 = 0.00000190734863281250
     2^-20 = 0.00000095367431640625
     2^-24 = 0.00000005960464477539
     2^-27 = 0.00000000745058059692
     2^-30 = 0.00000000093132257462
     2^-31 = 0.00000000046566128731
     2^-33 = 0.00000000011641532183
     2^-34 = 0.00000000005820766091
     2^-35 = 0.00000000002910383046
     2^-37 = 0.00000000000727595761
     2^-40 = 0.00000000000090949470
     2^-42 = 0.00000000000022737368
     2^-43 = 0.00000000000011368684
     2^-44 = 0.00000000000005684342
     2^-45 = 0.00000000000002842171
     2^-49 = 0.00000000000000177636
     2^-50 = 0.00000000000000088818
     2^-52 = 0.00000000000000022204
0x(3f f3 c0 83 12 6e 97 8d) (s=0 e=0 m=1.23449999999999993072) (1.2344999999999999307)
FLT_RADIX: 2
Single constants:
    FLT_MANT_DIG:    24
    FLT_DIG:         6
    FLT_MIN_EXP:     -125
    FLT_MIN_10_EXP:  -37
    FLT_MAX_EXP:     128
    FLT_MAX_10_EXP:  38
Double constants:
    DBL_MANT_DIG:    53
    DBL_DIG:         15
    DBL_MIN_EXP:     -1021
    DBL_MIN_10_EXP:  -307
    DBL_MAX_EXP:     1024
    DBL_MAX_10_EXP:  308
Long double constants:
    LDBL_MANT_DIG:   64
    LDBL_DIG:        18
    LDBL_MIN_EXP:    -16381
    LDBL_MIN_10_EXP: -4931
    LDBL_MAX_EXP:    16384
    LDBL_MAX_10_EXP: 4932
~~~~
