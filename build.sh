#!/usr/bin/env bash
D=dist/skjs
S=src

mkdir -p $D
rm -rf $D/*

touch $D/sk.js

cd src
SOURCES='_header.js model.js element.js _footer.js'
for file in $SOURCES; do
	cat $file >> ../$D/sk.js
	echo ";;" >> ../$D/sk.js
done
cd ../