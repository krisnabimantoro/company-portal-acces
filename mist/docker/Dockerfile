# Use the official Node.js image as the base image
FROM node:20-alpine

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the dependency-related files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build the application and verify it exists
RUN pnpm build && ls -la dist/ && ls -la dist/src/

# Expose the port the app runs on
EXPOSE 3040

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application using the production script
CMD ["pnpm", "start:prod"]
