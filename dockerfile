FROM node:20.17.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5555

CMD ["npm", "run", "start:prod"]
