# Step 1: Use official Node.js base image
FROM node:alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy function-level package files and install dependencies
COPY functions/package*.json ./functions/
RUN cd functions && npm install

# Step 4: Copy functions code
COPY functions ./functions

WORKDIR /app/functions

ENV RUNNING_IN_DOCKER=true

# Step 5: Expose app port (adjust if not 3000)
EXPOSE 3000

# Step 6: Run the app
CMD ["node", "index.js"]


