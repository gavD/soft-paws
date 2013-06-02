#!/bin/bash
cordova/clean
pushd `pwd`/assets/www
VER=`git describe --abbrev=0`
./compile.sh
popd
cordova/release
pushd `pwd`/bin
jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1 -keystore my-release-key.keystore -sigalg MD5withRSA -digestalg SHA1 -keystore ../my-release-key.keystore  SoftPaws-release-unsigned.apk SoftPaws
cp SoftPaws-release-unsigned.apk SoftPaws-$VER.apk
jarsigner -verify -verbose -certs SoftPaws-$VER.apk
popd
echo Built version $VER
echo `pwd`/bin/SoftPaws-$VER.apk | xclip -selection clipboard
rm `pwd`/assets/www/index.html
zipalign -f -v 4 `pwd`/bin/SoftPaws-$VER.apk bin/SoftPaws-al-$VER.apk
