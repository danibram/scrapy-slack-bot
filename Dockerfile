FROM arm64v8/node:16-alpine as builder

WORKDIR /usr/src/app
COPY . .
RUN npm ci
RUN npm run build

FROM arm64v8/node:16-alpine as js
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

FROM arm64v8/node:16-alpine
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/public/ public/
COPY --from=builder /usr/src/app/dist/ dist/
COPY --from=js /usr/src/app/node_modules/ node_modules/

EXPOSE 4000
CMD ["node", "dist"]