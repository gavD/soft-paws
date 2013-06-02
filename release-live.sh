#!/bin/bash
cordova/clean
pushd `pwd`/assets/www
export VER=`git describe --abbrev=0`

sed "s/versionName=\"0.[0-9]*\"/versionName=\"0.$VER\"/" AndroidManifest.xml > tmp1.xml
sed "s/versionCode=\"[0-9]*\"/versionCode=\"$VER\"/" tmp1.xml > AndroidManifest.xml
rm tmp1.xml

./compile.sh
popd

cordova/release
pushd `pwd`/bin
jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1 -keystore my-release-key.keystore -sigalg MD5withRSA -digestalg SHA1 -keystore ../my-release-key.keystore  SoftPaws-release-unsigned.apk SoftPaws
cp SoftPaws-release-unsigned.apk SoftPaws-$VER.apk
jarsigner -verify -verbose -certs SoftPaws-$VER.apk
popd
echo Built version $VER
rm `pwd`/assets/www/index.html
zipalign -f -v 4 `pwd`/bin/SoftPaws-$VER.apk bin/SoftPaws-al-$VER.apk
echo `pwd`/bin/SoftPaws-al-$VER.apk | xclip -selection clipboard
