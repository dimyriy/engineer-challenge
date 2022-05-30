FROM node:16.15.0

WORKDIR /app

COPY package.json yarn.lock .env ./

RUN rm -rf node_modules && yarn install --frozen-lockfile

COPY . .

EXPOSE 4000

CMD [ "yarn", "start" ]
