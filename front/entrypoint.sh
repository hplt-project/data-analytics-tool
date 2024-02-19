#!/bin/bash

cd /usr/app

/usr/bin/env >/usr/app/.env.local

pnpm start

tail -f /dev/null
