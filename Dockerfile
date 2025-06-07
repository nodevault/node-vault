# Use a slim Debian-based image as the base
FROM debian:bullseye-slim

# Begin the shell trick
SHELL ["/bin/bash", "--login", "-c"]

RUN apt update && apt install -y curl
# Get optional env var to set node version
ARG SET_NODE_VERSION
# Set default to node 18.20.8
ENV NODE_VERSION ${SET_NODE_VERSION:-18.20.8}
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
RUN nvm install $NODE_VERSION

# Confirm installation
RUN node --version
RUN npm --version

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json /app
COPY . /app
RUN npm install

# Maintain the stupid shell trick ¯\_(ツ)_/¯
ENTRYPOINT ["/bin/bash", "--login", "-c"]