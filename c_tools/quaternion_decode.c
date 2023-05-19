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
 * quaternion_decode - decode a 4-value quaternion into Euler angles.
 *
 * usage:
 *
 *     quaternion_decode <q0> <q1> <q2> <q3>
 *
 * <q0>, <q1>, <q2>, <q3> are the four terms of the quaternion
 *
 * Math is based from https://resources.inertiallabs.com/en-us/knowledge-base/euler-and-quaternion-angles-differences-and-why-it-matters
 */

#include <stdio.h>
#include <stdlib.h>
#include <math.h>

double radians_to_degrees(double radians)
{
    return radians * 57.29577051;
}

void decode_quaternion(double q0, double q1, double q2, double q3)
{
    double pitch, roll, heading;

    printf("Decode of quaternion: (%f, %f, %f, %f)\n",
           q0, q1, q2, q3);

    pitch = asin((2 * q2 * q3) + (2 * q0 * q1));

    roll = -atan2((2 * ((q1 * q3) - (q0 * q2))),
                  ((q0*q0) + (q3*q3) - (q1*q1) - (q2*q2)));

    heading = atan2((2 * ((q1 * q2) - (q0 * q3))),
                     ((q0*q0) + (q2*q2) - (q1*q1) - (q3*q3)));

    printf("Pitch angle: %f radians = %f degrees\n",
           pitch, radians_to_degrees(pitch));

    printf("Roll angle: %f radians = %f degrees\n",
           roll, radians_to_degrees(roll));

    printf("Heading angle: %f radians = %f degrees\n",
           heading, radians_to_degrees(heading));
}

int main(int argc, char *argv[])
{
    if (argc != 5)
    {
        fprintf(stderr, "usage: %s <q0> <q1> <q2> <q3>\n", argv[0]);
        return 1;
    }

    double q0, q1, q2, q3;

    q0 = atof(argv[1]);
    q1 = atof(argv[2]);
    q2 = atof(argv[3]);
    q3 = atof(argv[4]);

    decode_quaternion(q0, q1, q2, q3);

    return 0;
}
