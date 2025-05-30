import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// common middlewares
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));

// import routes
import healthCheckRoutes from './routes/healthCheck.routes.js';
import userRoutes from './routes/user.routes.js';
// import { errorHandler } from './middlewares/error.milddlewares.js';

// routes

app.use("/api/v1/healthcheck", healthCheckRoutes);
app.use("/api/v1/users", userRoutes);

// app.use(errorHandler);
export default app;