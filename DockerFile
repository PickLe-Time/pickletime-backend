# docker build -t ghcr.io/pickle-time/pickletime-backend:latest .
# docker run -d --name backend -p 5000:5000 ghcr.io/pickle-time/pickletime-backend:latest

FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
RUN npx prisma generate
CMD ["npm", "run", "start"]
