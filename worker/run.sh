#!/bin/sh

cd /youbike-worker

echo "[$(date)][START] Get and Store Data "

node src/pullData
node src/seedData

echo "[$(date)][END] Get and Store Data\n"