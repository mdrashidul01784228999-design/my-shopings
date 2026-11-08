FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build
ENV NODE_ENV=production PORT=3000
# products, orders and uploaded images live here - mount a volume!
VOLUME ["/app/storage"]
EXPOSE 3000
CMD ["npm", "start"]
