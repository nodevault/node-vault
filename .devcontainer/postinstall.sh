#!/bin/bash

# Install dependencies
echo '[+] Installing dependencies...'
npm install
clear
echo '[+] Dependencies installed!'
echo '[+] Running tests...'
npm run test:unit
clear
echo '[+] Tests passed!'
echo '[+] Development environment ready!'
