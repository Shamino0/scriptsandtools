/*
 * Copyright (C) 2013-2023 David Charlap
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 */

/*
 * dumpfloat - print out a breakdown of floating point numbers.
 *
 * usage:
 *
 *    dumpfloat [-hex]|[-dec] [-single]|[-double] <value>
 *
 * <value> is the input number to parse.  If a decimal point appears in the
 *         string, it is assumed to be a decimal number.  If not, it is assumd
 *         to be an internal hex representation.  For a decimal number, output
 *         will be both as float and as double.  For a hex representation, the
 *         number of digits (8 or 16) will determine whether it is treated as
 *         float or double.  For other counts of hex digits, the value will be
 *         padded to 8 or 16 by trailing zeros - which may be wrong.
 *
 * -hex    forces the parser to interpret the digits as hexadecimal
 * -dec    forces the parser to interpret the digits as decimal
 * -single forces the parser to interpret hex digits as float.  Decimal values
 *         will be output only as float
 * -double forces the parser to interpret hex digits as double.  Decimal values
 *         will be output only as double
 * -debug  dumps the intermediate values during display of the values and some
 *         data from the C library.
 *
 * IEEE floating point representation is:
 *
 * single (4 byte) precision:
 *
 *    seeeeeeeemmmmmmmmmmmmmmmmmmmmmmm
 *
 * s = sign bit.  1 if negative.  0 if positive
 * e = 8 bit excess-128 base-2 exponent
 * m = 23-bit mantissa (leading 1 is implied and not stored)
 *
 *
 * double (8 byte) precision:
 *
 *    seeeeeeeeeeemmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
 *
 * s = sign bit.  1 if negative.  0 if positive
 * e = 11-bit excess-1024 base-2 exponent
 * m = 53 bit mantissa (leading 1 is impled and not stored)
 *
 * Known bugs: this code displays the values as they are represented by the
 *             host compiler.  Actually parsing decimal into IEEE format is too
 *             much for me to write in a simple program like this.  This means
 *             that if the code is compiled on a platform without IEEE floats
 *             (or where a float and double have lengths other than 4 and 8),
 *             it will not behave properly.  The breakdown of the float into
 *             fields is only tested on Intel chips.  It may be wrong
 *             elsewhere.
 *
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <float.h>

#define FLAG_HEX    (0x01)
#define FLAG_DEC    (0x02)
#define FLAG_SINGLE (0x04)
#define FLAG_DOUBLE (0x08)
#define FLAG_DEBUG  (0x10)

typedef union
{
    double        d;
    unsigned char bytes[1];
} doubleUnion;

typedef union
{
    float         f;
    unsigned char bytes[1];
} floatUnion;

static int   flags = 0;
static char *hexDigits="0123456789abcdef";

#define hexDigitToInt(x) (strchr(hexDigits,tolower(x)) - hexDigits)

void usage(FILE *f)
{
    fprintf(f,
            "usage: dumpfloat [-hex]|[-dec] [-single]|[-double] [-debug] <value>\n");
}

int parseArgs(int argc, char *argv[])
{
    int   i;
    char *arg;

    for (i=1; i<argc; i++)
    {
        arg = argv[i];

        if (arg[0] != '-')
            return i;

        if (strcmp(arg, "-hex") == 0)
            flags |= FLAG_HEX;
        else if (strcmp(arg, "-dec") == 0)
            flags |= FLAG_DEC;
        else if (strcmp(arg, "-single") == 0)
            flags |= FLAG_SINGLE;
        else if (strcmp(arg, "-double") == 0)
            flags |= FLAG_DOUBLE;
        else if (strcmp(arg, "-debug") == 0)
            flags |= FLAG_DEBUG;
        else
        {
            fprintf(stderr, "dumpfloat: bad arg \"%s\"\n", arg);
            usage(stderr);
            exit(1);
        }
    }

    return i;
}

void determineValueType(char *valueString)
{
    char *digit;

    for(digit=valueString; *digit != '\0'; digit++)
    {
        if (*digit == '.')
        {
            flags |= FLAG_DEC;
            return;
        }
    }

    flags |= FLAG_HEX;
}

int syntaxCheck(char *valueString)
{
    int len, parseLen;

    len = strlen(valueString);
    if (flags & FLAG_DEC)
        parseLen = strspn(valueString, "0123456789-.eE");
    else
        parseLen = strspn(valueString, "0123456789abcdefABCDEF");

    return (len == parseLen);
}

void doDumpConstants()
{
    printf("FLT_RADIX: %d\n", FLT_RADIX);
    
    if (flags & FLAG_SINGLE)
    {
        printf("Single constants:\n");
        printf("    FLT_MANT_DIG:    %d\n", FLT_MANT_DIG);
        printf("    FLT_DIG:         %d\n", FLT_DIG);
        printf("    FLT_MIN_EXP:     %d\n", FLT_MIN_EXP);
        printf("    FLT_MIN_10_EXP:  %d\n", FLT_MIN_10_EXP);
        printf("    FLT_MAX_EXP:     %d\n", FLT_MAX_EXP);
        printf("    FLT_MAX_10_EXP:  %d\n", FLT_MAX_10_EXP);
    }

    if (flags & FLAG_DOUBLE)
    {
        printf("Double constants:\n");
        printf("    DBL_MANT_DIG:    %d\n", DBL_MANT_DIG);
        printf("    DBL_DIG:         %d\n", DBL_DIG);
        printf("    DBL_MIN_EXP:     %d\n", DBL_MIN_EXP);
        printf("    DBL_MIN_10_EXP:  %d\n", DBL_MIN_10_EXP);
        printf("    DBL_MAX_EXP:     %d\n", DBL_MAX_EXP);
        printf("    DBL_MAX_10_EXP:  %d\n", DBL_MAX_10_EXP);

        printf("Long double constants:\n");
        printf("    LDBL_MANT_DIG:   %d\n", LDBL_MANT_DIG);
        printf("    LDBL_DIG:        %d\n", LDBL_DIG);
        printf("    LDBL_MIN_EXP:    %d\n", LDBL_MIN_EXP);
        printf("    LDBL_MIN_10_EXP: %d\n", LDBL_MIN_10_EXP);
        printf("    LDBL_MAX_EXP:    %d\n", LDBL_MAX_EXP);
        printf("    LDBL_MAX_10_EXP: %d\n", LDBL_MAX_10_EXP);
    }
}

void dumpFloat(floatUnion *f)
{
    unsigned char *bytes;
    int            s;
    int            e;
    double         m, term;
    int            i, j, power;

    bytes = f->bytes;
    s = bytes[3] >> 7;
    e = ((bytes[3] << 1) | (bytes[2] >> 7)) & 0xFF;
    e -= 127;

    m = term = 1.0;
    power = 0;

    if (flags & FLAG_DEBUG)
    {
        printf("breakdown of mantissa for %.10g\n", (double)f->f);
        printf("     2^%3d = %.20f\n", power, term);
    }

    for(i=2; i>=0; i--)
    {
        if (i==2)
            j = 6;
        else
            j = 7;

        while (j >= 0)
        {
            term /= 2.0;
            power--;
            if (bytes[i] & (1 << j))
            {
                m += term;
                if (flags & FLAG_DEBUG)
                    printf("     2^%3d = %.20f\n", power, term);
            }
            j--;
        }
    }

    printf("0x(%02x %02x %02x %02x) (s=%d e=%d m=%.20f) (%.20g)\n",
           bytes[3], bytes[2], bytes[1], bytes[0],
           s, e, m, (double)f->f);
}

void dumpDouble(doubleUnion *d)
{
    unsigned char *bytes;
    int            s;
    int            e;
    double         m, term;
    int            i, j, power;

    bytes = d->bytes;
    s = bytes[7] >> 7;
    e = ((bytes[7] << 4) | (bytes[6] >> 4)) & 0x07FF;
    e -= 1023;

    m = term = 1.0;
    power = 0;

    if (flags & FLAG_DEBUG)
    {
        printf("breakdown of mantissa for %.20g\n", d->d);
        printf("     2^%3d = %.20f\n", power, term);
    }

    for(i=6; i>=0; i--)
    {
        if (i==6)
            j = 3;
        else
            j = 7;

        while (j >= 0)
        {
            term /= 2.0;
            power--;
            if (bytes[i] & (1 << j))
            {
                m += term;
                if (flags & FLAG_DEBUG)
                    printf("     2^%3d = %.20f\n", power, term);
            }
            j--;
        }
    }

    printf("0x(%02x %02x %02x %02x %02x %02x %02x %02x) "
           "(s=%d e=%d m=%.20f) (%.20g)\n",
           bytes[7], bytes[6], bytes[5], bytes[4], bytes[3], bytes[2],
           bytes[1], bytes[0], s, e, m, d->d);
}

void doHex(char *valueString)
{
    floatUnion  f;
    doubleUnion d;
    int         i;
    char       *parseChar;

    parseChar = valueString;
    memset(&f, 0, sizeof(f));
    memset(&d, 0, sizeof(d));

    for (i=0; (i<8) && (*parseChar != '\0'); i++, parseChar++)
    {
        d.bytes[7-i] = hexDigitToInt(*parseChar) << 4;
        if (parseChar[1] != '\0')
        {
            parseChar++;
            d.bytes[7-i] |= hexDigitToInt(*parseChar);
        }

        if (i<4)
            f.bytes[3-i] = d.bytes[7-i];
    }

    switch (flags & (FLAG_SINGLE | FLAG_DOUBLE))
    {
      case FLAG_SINGLE:
        dumpFloat(&f);
        break;
      case FLAG_DOUBLE:
        dumpDouble(&d);
        break;
      default:
        flags |= (FLAG_SINGLE | FLAG_DOUBLE);
        dumpFloat(&f);
        dumpDouble(&d);
    }
}

void doDecimal(char *valueString)
{
    floatUnion f;
    doubleUnion d;

    d.d = strtod(valueString, NULL);
    f.f = d.d;

    switch (flags & (FLAG_SINGLE | FLAG_DOUBLE))
    {
      case FLAG_SINGLE:
        dumpFloat(&f);
        break;
      case FLAG_DOUBLE:
        dumpDouble(&d);
        break;
      default:
        flags |= (FLAG_SINGLE | FLAG_DOUBLE);
        dumpFloat(&f);
        dumpDouble(&d);
    }
}

int main(int argc, char *argv[])
{
    int   argposValue;
    char *argValue;

    argposValue = parseArgs(argc, argv);
    if (argposValue == argc)
    {
        fprintf(stderr, "dumpfloat: missing value\n");
        usage(stderr);
        exit(2);
    }

    argValue = argv[argposValue];

    switch (flags & (FLAG_DEC | FLAG_HEX))
    {
      case 0:
        determineValueType(argValue);
        break;

      case FLAG_DEC:
      case FLAG_HEX:
        break;

      default:
        fprintf(stderr, "dumpfloat: can't specify both -dec and -hex\n");
        usage(stderr);
        exit(3);
    }

    if (!syntaxCheck(argValue))
    {
        fprintf(stderr, "dumpfloat: illegal %s digit in string\n",
                (flags & FLAG_DEC)?"decimal":"hex");
        usage(stderr);
        exit(4);
    }

    if (flags & FLAG_HEX)
        doHex(argValue);
    else
        doDecimal(argValue);

    if (flags & FLAG_DEBUG)
        doDumpConstants();

    exit(0);
    return 1;
}
