FROM node:22-alpine
WORKDIR /usr/src/app

# Copy package files first (better caching)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

# Remove dev dependencies after build
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

EXPOSE 3000
CMD ["node", "dist/main"]