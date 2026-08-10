# Use official Node.js runtime as parent image
FROM node:18-slim

# Install system dependencies (LibreOffice for document conversion & standard font packages)
RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-dejavu \
    fonts-liberation \
    fonts-noto-cjk \
    fonts-roboto \
    && rm -rf /var/lib/apt/lists/*

# Set working directory in container
WORKDIR /usr/src/app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install Node dependencies in production mode
RUN npm ci --only=production

# Copy remaining source code files
COPY . .

# Create uploads and temp scratch directories
RUN mkdir -p uploads/temp

# Set default env values
ENV PORT=5000
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Run the app
CMD [ "npm", "start" ]
