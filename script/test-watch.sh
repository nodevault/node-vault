#!/bin/sh

export VAULT_ADDR=http://$NODEVAULT_VAULT_1_PORT_8200_TCP_ADDR:8200
./node_modules/.bin/mocha --require blanket -w test/*.coffee