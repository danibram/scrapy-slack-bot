FROM mhart/alpine-node:latest as build
RUN apk add --no-cache make gcc g++ python

WORKDIR /usr/src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

RUN npm run build

FROM mhart/alpine-node:latest

WORKDIR /usr/src

ENV PORT 4000

COPY --from=build /usr/src .

EXPOSE $PORT
CMD [ "npm", "run", "prod" ]