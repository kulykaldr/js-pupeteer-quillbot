FROM ghcr.io/puppeteer/puppeteer:21.0.3

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD [ "node", "index.js" ]