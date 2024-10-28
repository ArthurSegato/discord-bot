# Use the official Bun image as the base
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy the package and lock files
COPY bun.lockb package.json /app/

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . /app

# Define the command to start the bot
CMD ["bun", "run", "start"]