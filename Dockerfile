FROM mhart/alpine-node:6
WORKDIR /app
COPY . /app
RUN npm install
# CMD ["/bin/sh", "./script/test.sh"]
