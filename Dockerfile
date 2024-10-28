# Use the official Bun image as the base
FROM oven/bun:alpine

# Set the working directory
WORKDIR /app

# Copy the package and lock files
COPY bun.lockb package.json /app/

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . /app

RUN rm -rf /app/src/deploy-commands.js

# Define the command to start the bot
CMD ["bun", "run", "start"]