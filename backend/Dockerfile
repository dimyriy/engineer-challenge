FROM node:16-alpine

WORKDIR /app

COPY package.json yarn.lock .env ./

RUN rm -rf node_modules && yarn install --frozen-lockfile --production=true

COPY . .

EXPOSE 4000

CMD [ "yarn", "start" ]
