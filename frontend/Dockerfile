FROM node:16-alpine3.14
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install gl-react
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
