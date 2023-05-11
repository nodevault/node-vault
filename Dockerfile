FROM node:18.14.0
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
