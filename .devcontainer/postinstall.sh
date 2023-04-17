#!/bin/bash

# Install dependencies
echo '[+] Installing dependencies...'
npm install
clear
echo '[+] Dependencies installed!'
echo '[+] Running tests...'
npm t
clear
echo '[+] Tests passed!'
