#!/bin/sh
NAME="cell-maps"
BP=build

rm -rf $BP
mkdir -p $BP
mkdir -p $BP/tmp
mkdir -p $BP/fonts
mkdir -p $BP/fontawesome
mkdir -p $BP/images
mkdir -p $BP/css

vulcanize \
    --inline-scripts \
    --inline-css \
    --strip-comments \
    src/$NAME-element.html > $BP/tmp/build.html

crisper \
    --source $BP/tmp/build.html \
    --html $BP/tmp/$NAME-element.html \
    --js $BP/tmp/$NAME.js

uglifyjs $BP/tmp/$NAME.js > $BP/tmp/$NAME.min.js
sed -i s@$NAME.js@$NAME.min.js@g $BP/tmp/$NAME-element.html
rm -rf $BP/tmp/build.html

cp COPYING $BP/
cp README.md $BP/

mv $BP/tmp/$NAME-element.html $BP/
mv $BP/tmp/$NAME.js $BP/
mv $BP/tmp/$NAME.min.js $BP/
cp -r conf $BP/
cp -r example-files $BP/
cp -r cell-maps-index.html $BP/index.html

#
# fix index.html paths
#
sed -i s@lib/jsorolla/styles/@@g $BP/index.html
cp -r lib/jsorolla/styles/fonts/* $BP/fonts/

sed -i s@bower_components/@@g $BP/index.html
cp -r bower_components/fontawesome/css $BP/fontawesome/
cp -r bower_components/fontawesome/fonts $BP/fontawesome/
cp -r bower_components/webcomponentsjs $BP/

sed -i s@lib/jsorolla/src/lib/components/@css/@g $BP/index.html
cp -r lib/jsorolla/src/lib/components/jso-global.css $BP/css/
cp -r lib/jsorolla/src/lib/components/jso-form.css $BP/css/
cp -r lib/jsorolla/src/lib/components/jso-dropdown.css $BP/css/

sed -i s@src/@@g $BP/index.html
## end fix paths


rm -rf $BP/tmp
