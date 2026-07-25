import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { getJobMatches } from "../controllers/jobMatchController.js";

const router = express.Router();

router.get("/match", verifyToken, getJobMatches);

export default router;