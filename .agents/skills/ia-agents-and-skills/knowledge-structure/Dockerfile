FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install

COPY src /app/src

CMD ["node", "src/lint.js"]
