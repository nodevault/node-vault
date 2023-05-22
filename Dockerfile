# Use a slim Debian-based image as the base
FROM debian:bullseye-slim

SHELL ["/bin/bash", "--login", "-c"]

RUN apt update && apt install -y curl
# Get optional env var to set node version
ARG SET_NODE_VERSION
# Set default to node 14.15.4
ENV NODE_VERSION ${SET_NODE_VERSION:-14.15.4}
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
RUN nvm install $NODE_VERSION

# Confirm installation
RUN node --version
RUN npm --version

# Add your application files and execute necessary commands
# ...

# Specify the default command to run when the container starts
# CMD [ "npm", "start" ]
WORKDIR /app

COPY package.json /app
RUN npm install
COPY . /app
