FROM node:18-alpine AS runner
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "run", "dev"]