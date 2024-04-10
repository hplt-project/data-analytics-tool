FROM node:18-alpine AS runner
WORKDIR /app
RUN mkdir -p /work/yaml_dir/
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "run", "dev"]