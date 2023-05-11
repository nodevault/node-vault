FROM node:14.21-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
