FROM mhart/alpine:latest

RUN mkdir -p app

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 4000

CMD ["npm", "start"]