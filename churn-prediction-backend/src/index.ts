import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import routes from '@/routes/routes.js';
import { auth } from '@/utils/auth.js';
import { globalErrorHandler } from '@/middleware/errorMiddleware.js';

const app = express();
const port = process.env.PORT || 8000;
const host = process.env.HOST || '0.0.0.0';
const allowedOrigins = [
   process.env.FRONTEND_ORIGIN,
   process.env.FRONTEND_URL,
   process.env.BETTER_AUTH_URL,
   'http://localhost',
   'http://localhost:8080',
   'http://localhost:5173',
   'http://localhost:3000',
   'http://localhost:8000',
].filter((origin): origin is string => Boolean(origin));

app.use(
   cors({
      origin: allowedOrigins,
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
   }),
);

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());

app.use('/api', routes);
app.use(globalErrorHandler);

app.listen(Number(port), host, () => {
   console.log(`Retentio backend is running at http://${host}:${port}`);
});
