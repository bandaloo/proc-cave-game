#!/bin/bash

# Change these if you want to run the score server on a different domain from
# the main content.
SCORE_SERVER_SCHEME=https
SCORE_SERVER_DOMAIN=afterlightcaves.com

./build-prod.sh


#npm run compile-compat && npm run browserify-compat
#cp static/index.html dist/
#cp static/style.css dist/
#cp static/license.txt dist/
#cp static/favicon.ico dist/
#cp static/anonymous-pro-b.ttf dist/
#sed -i --posix 's/<script type="module" src="main.js"/<script src="bundle.js"/g' dist/index.html
#if [ -n "$SCORE_SERVER_SCHEME" ] && [ -n "$SCORE_SERVER_DOMAIN" ]
#then
#	sed -i --posix 's/var GAME_URL = ".*";/var GAME_URL = "'$SCORE_SERVER_SCHEME':\/\/'$SCORE_SERVER_DOMAIN'";/g' dist/bundle.js
#fi
#cp -r static/sounds dist/
#cp -r static/images dist/
#rm -r build
echo "p, table, div#credits-container, div#title-holder, span#version { display: none; }" >> dist/style.css
echo "div#gamediv-holder { height: 100%; }" >> dist/style.css