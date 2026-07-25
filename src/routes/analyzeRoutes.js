import express from "express";
import { Router } from 'express';
import analyseModel from "../models/Analysis.js";
import upload from "../middlewares/upload.js";
import { analyzeResume, getHistory } from "../controllers/analyzeController.js";
import { verifyToken } from "../middlewares/verifyToken.js";



const router = Router();


router.post('/upload',verifyToken, upload.single('resume'), analyzeResume);

router.get('/history',verifyToken , getHistory)

export default router;

// import { compareResumeWithJob } from "../utils/compareResume.js";
// import { extractText } from "../utils/extractText.js";

// router.post("/analyse", upload.single("resume"), async (req, res, next) => {
//     try {
//         const {jobDescription} = req.body;

//         if(!req.file) 
//             return res.status(400).json({error: 'Resume PDF is required'})

//         if(!jobDescription) return res.status(400).json({error: 'Job description is required'});

//         //  const {resumeText, result} = await compareResumeWithJob(req.file.buffer, jobDescription);
//         const result = await compareResumeWithJob(req.file.buffer, jobDescription);
//         const resumeText = await extractText(req.file);

//          const analysis = await analyseModel.create({
//             resumeFileName: req.file.originalname,
//             resumeText,
//             jobDescription,
//             result
//          })

//          res.json({id: analysis._id, ...result});

//     } catch (error) {
//         next(error)
//     }
// });

// // Get a past analysis by ID

// router.get('/analyze/:id', async(req, res, next)=> {
//     try {
//         const analysis = await analyseModel.findById(req.params.id);
//         if(!analysis) return res.status(404).json({error: 'Not found'});
//         res.json(analysis)
//     } catch (error) {
//         next(error)
//     }
// });


// router.get('/history', async (req, res, next) => {
//     try {
//         const list = await analyseModel.find({}, 'resumeFileName jobDescription result.matchScore createdAt')
//           .sort({createdAt: -1});
//           res.json(list)
//     } catch (error) {
//         next(error)
//     }
// })

// export default router;






