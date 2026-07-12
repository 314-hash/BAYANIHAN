FROM node:20-alpine

# Install git and other build tools if needed
RUN apk add --no-cache git bash

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install all dependencies (development + production)
RUN npm ci

# Copy the rest of the codebase
COPY . .

# Compile smart contracts to generate the required build artifacts
RUN npx hardhat compile

# Expose default ports
EXPOSE 8545 3001 3000
