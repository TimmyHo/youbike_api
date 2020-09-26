#!/bin/sh

cd /youbike

echo '[START] Get and Store Data'

/usr/local/bin/node src/pullData
/usr/local/bin/node src/seedData

echo '[END] Get and Store Data'