FROM mhart/alpine-node:6
WORKDIR /app
COPY . /app
RUN npm install
