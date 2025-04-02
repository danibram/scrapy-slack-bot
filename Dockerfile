ARG BASE_IMAGE=node:20-alpine
FROM ${BASE_IMAGE} as builder

WORKDIR /usr/src/app
COPY . .
RUN npm ci
RUN npm run build

FROM ${BASE_IMAGE} as js
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

FROM ${BASE_IMAGE}
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/public/ public/
COPY --from=builder /usr/src/app/dist/ dist/
COPY --from=js /usr/src/app/node_modules/ node_modules/

EXPOSE 4000
CMD ["node", "dist"]