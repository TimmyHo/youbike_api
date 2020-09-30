#!/bin/sh

env >> /etc/environment

/etc/init.d/cron start

# Since google cloud run requires a listener to env.PORT start a express server
# (without this requirement, could just start cron in the foreground)
#
# https://cloud.google.com/run/docs/reference/container-contract
npm run start

# cron -f