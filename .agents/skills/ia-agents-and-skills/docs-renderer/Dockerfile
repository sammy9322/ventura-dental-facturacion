FROM node:20

# Install Google Chrome Stable and fonts
# This pulls in all necessary dependencies for Puppeteer's bundled Chromium (or Chrome itself)
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set shared cache dir for puppeteer
ENV PUPPETEER_CACHE_DIR=/app/.cache
RUN mkdir -p /app/.cache && chmod 777 /app/.cache

# Install deps
COPY package.json .
RUN npm install

# Copy source
COPY src /app/src
COPY assets /app/assets

# Create work dir
RUN mkdir -p /app/work && chmod 777 /app/work

# Env to tell puppeteer to use its own downloaded chrome (default)
# But we need to make sure we don't have the previous ENV var issue.
# Here we start fresh.

ENV PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox"
