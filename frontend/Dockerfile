FROM node:20-alpine

WORKDIR /app

# Copy package descriptors first to take advantage of Docker caching
COPY package.json package-lock.json ./

RUN npm install

# Copy source files
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
