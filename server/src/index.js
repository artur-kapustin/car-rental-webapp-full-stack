import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger-config.js";
import cookieParser from "cookie-parser";
import carRouter from "./routes/car-router.js";
import userRouter from "./routes/user-router.js";
import tokensRouter from "./routes/token-router.js";
import corsOptions from "./utils/corsOptions.js";

const nodeEnv = process.env.NODE_ENV || "dev";
const app = express();
const port = 3000;

// Set up basic JSON parsing and CORS headers
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Setup swagger and make it available on /api-docs.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/cars", carRouter);
app.use("/users", userRouter);
app.use("/tokens", tokensRouter);

// Global error handler. In your code, throw an object with a status and message, and it will be caught here. We ignore one eslint call here, because next is needed.
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
    console.error(err);
    res
        .status(err.status || 500)
        .json({
            error: err.message || "Something went wrong!"
        });
});

// Setup server, by default on port 3000
app.listen(port, () => {
    // We allow this one console log here, because it helps us understand the server is actually running.
    // eslint-disable-next-line no-console
    console.log(`App listening on port ${port}, running in ${nodeEnv} mode.`);
});

// Export app for testing purposes
export default app;