import express from "express";
import cors from "cors";


const app = express();
//basic configuration of express app
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // to serve static files from public folder


//cors config
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

import healthcheckrouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";

app.use("/api/auth", authRouter); 
app.use("/api/v1/healthcheck", healthcheckrouter);

app.get('/', (req, res) => {
    res.send("Hello World");
})

export default app;