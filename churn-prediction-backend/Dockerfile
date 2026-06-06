FROM node:20-alpine

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8000
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
COPY docker/entrypoint.sh ./docker/entrypoint.sh

RUN npm run prisma:generate
RUN npm run build
RUN chmod +x ./docker/entrypoint.sh

ENV NODE_ENV=production

EXPOSE 8000

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["npm", "run", "start"]
