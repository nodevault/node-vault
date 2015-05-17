FROM mhart/alpine-node
WORKDIR /src
ADD . /src
RUN npm install

CMD ["/bin/sh", "./script/test.sh"]
