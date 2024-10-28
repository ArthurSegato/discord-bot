# Use the official Bun image as the base
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy the package and lock files
COPY /builds/korosan /app/

# Define the command to start the bot
CMD ["./korosan"]