all : dumpfloat quaternion_decode

dumpfloat : dumpfloat.c
	gcc dumpfloat.c -o dumpfloat

quaternion_decode : quaternion_decode.c
	gcc quaternion_decode.c -o quaternion_decode -lm

clean :
	rm -f dumpfloat dumpfloat.o
	rm -f quaternion_decode quaternion_decode.o
