FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies with caching by first copying manifest files
COPY EcoRideConnect/package*.json ./EcoRideConnect/
RUN cd EcoRideConnect \
  && npm ci

# Copy source and build
COPY EcoRideConnect ./EcoRideConnect
WORKDIR /app/EcoRideConnect
RUN npm run build

# Run the production server
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]
