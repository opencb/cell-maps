#!/bin/sh
mkdir -p build
rm -rf build/index.html build/index.js build/workers build/fonts build/example-files

vulcanize cell-maps-index.html -o build/index.html --strip --csp --inline

cp -r lib/jsorolla/bower_components/fontawesome/fonts build/
cp -r src/fonts/*.woff* build/fonts/
cp -r example-files build/

sed -i s@../lib/jsorolla/bower_components/fontawesome/fonts/fontawesome-webfont.@fonts/fontawesome-webfont.@g build/index.html
sed -i s@../src/fonts/@fonts/@g build/index.html
