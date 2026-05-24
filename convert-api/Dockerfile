# ── Stage: runtime ──────────────────────────────────────────────────────────
FROM node:20-slim

# Install LibreOffice + minimal fonts (no desktop GUI needed)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libreoffice-writer \
        libreoffice-impress \
        libreoffice-calc \
        fonts-liberation \
        fonts-dejavu \
        fontconfig && \
    fc-cache -fv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy app source
COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]
