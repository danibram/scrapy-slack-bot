FROM mhart/alpine-node:latest as builder
RUN apk add --no-cache make gcc g++ python

WORKDIR /usr/src/app
COPY . .
RUN npm ci
RUN npm run build

FROM mhart/alpine-node:latest as js
ENV NODE_ENV=production
RUN apk add --no-cache make gcc g++ python
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

FROM alpine:3.9
RUN apk add --no-cache tini
ENV NODE_ENV=production

COPY --from=js /usr/bin/node /usr/bin/
COPY --from=js /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/public/ public/
COPY --from=builder /usr/src/app/dist/ dist/
COPY --from=js /usr/src/app/node_modules/ node_modules/

EXPOSE 4000
CMD ["/sbin/tini","--", "node", "dist"]