import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import analyseDataRoutes from "./routes/analyzeRoutes.js";
import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobMatchRoutes from "./routes/jobMatchRoutes.js";
import resumeAnalysisRoutes from "./routes/resumeAnalysisRoutes.js";


const app = express();
// allow frontend to talk to backend
app.use(cors({
    origin: ["http://localhost:5173", "https://just-career-ai-frontend-zeta.vercel.app"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/analyse", analyseDataRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobMatchRoutes);
app.use("/api/resume-analysis", resumeAnalysisRoutes);

app.get('/health', (req, res)=> {
    res.status(200).json({message: 'Server is Healthy'})
})


export default app;
