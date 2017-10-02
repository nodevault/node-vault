FROM node:8-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
