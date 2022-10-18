FROM node:12.16.1-alpine
 ##8.6-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
