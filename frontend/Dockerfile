FROM node:16-alpine3.14
WORKDIR /app
COPY package*.json ./
RUN npm install && npm i @react-three/drei
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
