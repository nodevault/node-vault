FROM mhart/alpine-node:5
WORKDIR /app
COPY . /app
RUN npm install
# CMD ["/bin/sh", "./script/test.sh"]
