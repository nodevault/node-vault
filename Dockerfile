FROM mhart/alpine-node:6
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
