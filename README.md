Soft Paws - a game for cats!
============================

This is a cat toy - like chasing a laser pen, or hiding in a box!

This was Annie's idea. It's not the first of it's kind but it felt like a good way to try out Hammer.js!

Simply run the at and let the kitties pat away at the dots! Please note, if they scratch your screen, that's on you, so please use a screen protector! ;-)

Licensing
=========

Licensed under the GPLv3 license.

Technical
=========

Keys
----

You'll need a release keystore to make a release, something along the lines of:

    keytool -genkey -v -keystore my-release-key.keystore -alias SoftPaws -keyalg RSA -keysize 2048 -validity 10000

Build in Apache Cordova
-----------------------

You need Cordova installed. Once you have that, you can test and release using the supplied helper scripts.

Test using:

    ./test.sh

Release using:

    ./release.sh
