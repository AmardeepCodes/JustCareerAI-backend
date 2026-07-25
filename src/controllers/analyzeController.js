import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');

import { GoogleGenerativeAI } from '@google/generative-ai';
import Analysis from '../models/Analysis.js';
import ResumeProfile from '../models/ResumeProfile.js';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is missing');
}

const genAI = new GoogleGenerativeAI(apiKey);





const extractTextFromPDF = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataError', (err) => reject(err.parserError));
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = pdfData.Pages.map(page =>
        page.Texts.map(t => {
          try {
            return decodeURIComponent(t.R.map(r => r.T).join(''));
          } catch {
            return t.R.map(r => r.T).join(''); // decode fail ho toh raw text use karo
          }
        }).join(' ')
      ).join('\n');
      resolve(text);
    });
    pdfParser.parseBuffer(buffer);
  });
};

export const analyzeResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file)            return res.status(400).json({ error: 'Resume PDF is required' });
    if (!jobDescription?.trim()) return res.status(400).json({ error: 'Job description is required' });

    const resumeText = await extractTextFromPDF(req.file.buffer);

    if (!resumeText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from PDF.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    // ── Step 1: Resume data extract karo ──────────────────────────────────
    const profilePrompt = `
      Extract resume information and return ONLY valid JSON. No markdown.
      {
        "name": "",
        "email": "",
        "phone": "",
        "linkedin": "",
        "github": "",
        "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "duration": "" }],
        "experience": [{ "company": "", "position": "", "location": "", "duration": "", "bullets": [] }],
        "projects":   [{ "title": "", "description": "", "techStack": [], "duration": "" }],
        "skills": {
          "languages": [], "backend": [], "databases": [],
          "tools": [], "devops": [], "coreConcepts": []
        },
        "achievements": [{ "title": "", "description": "", "duration": "" }]
      }
      Resume: ${resumeText}
    `;

    const profileResult = await model.generateContent(profilePrompt);
    const profileRaw    = profileResult.response.text();
    const profileClean  = profileRaw.replace(/```json|```/g, "").trim();
    const profile       = JSON.parse(profileClean);

    // ── Step 2: Profile + JD save karo ResumeProfile mein ────────────────
    await ResumeProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        ...profile,
        userId: req.user.id,
        lastJobDescription: jobDescription, // ✅ JD save ho raha hai
      },
      { upsert: true, new: true }
    );

    // ── Step 3: ATS Score calculate karo ──────────────────────────────────
    const atsPrompt = `
      You are an ATS expert. Compare this resume against the job description.
      Return ONLY valid JSON. No markdown.
      {
        "matchScore": <number 0-100>,
        "matchedKeywords": [<keywords found in both>],
        "missingKeywords": [<important keywords in JD missing from resume>],
        "suggestions": [<3-5 actionable tips>]
      }
      RESUME: ${resumeText}
      If the JOB Description is empty or user say anything except related to job description , then give ats score according to standard resume and give suggestions to improve resume.
      JOB DESCRIPTION: ${jobDescription}
      
    `;

    const atsResult = await model.generateContent(atsPrompt);
    const atsRaw    = atsResult.response.text();
    const atsClean  = atsRaw.replace(/```json|```/g, '').trim();
    const parsed    = JSON.parse(atsClean);

    // ── Step 4: Analysis history save karo ────────────────────────────────
    const saved = await Analysis.create({
      userId:          req.user.id,
      resumeFileName:  req.file.originalname,
      jobDescription,
      matchScore:      parsed.matchScore,
      matchedKeywords: parsed.matchedKeywords,
      missingKeywords: parsed.missingKeywords,
      suggestions:     parsed.suggestions,
    });

    res.status(201).json({ success: true, data: saved });

  } catch (err) {
    console.error('analyzeResume error:', err.message);
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: analyses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};








// dotenv.config();


// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const PDFParser = require('pdf2json');

// import { GoogleGenerativeAI } from '@google/generative-ai';
// import Analysis from '../models/Analysis.js';
// import ResumeProfile from '../models/ResumeProfile.js';


// const genAI = new GoogleGenerativeAI('AIzaSyAa189tb16F6bvM6U5hy8S_WHVLs3AP6nI');
// // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const extractTextFromPDF = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new PDFParser();

//     pdfParser.on('pdfParser_dataError', (err) => reject(err.parserError));

//     pdfParser.on('pdfParser_dataReady', (pdfData) => {
//       const text = pdfData.Pages.map(page =>
//         page.Texts.map(t => decodeURIComponent(t.R.map(r => r.T).join(''))).join(' ')
//       ).join('\n');
//       resolve(text);
//     });

//     pdfParser.parseBuffer(buffer);
//   });
// };

// export const analyzeResume = async (req, res) => {
//   try {
//     const { jobDescription } = req.body;

//     if (!req.file) return res.status(400).json({ error: 'Resume PDF is required' });
//     if (!jobDescription?.trim()) return res.status(400).json({ error: 'Job description is required' });

//     const resumeText = await extractTextFromPDF(req.file.buffer);
//     const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

//     if (!resumeText.trim()) {
//       return res.status(400).json({ error: 'Could not extract text from PDF.' });
//     }

//     const profilePrompt  =  `
//     Extract resume information and return ONLY valid JSON.
//      {
//        "name": "",
//        "email": "",
//        "phone": "",
//        "linkedin": "",
//        "github": "",
//        "education": [],
//        "experience": [],
//        "projects": [],
//        "skills": []
//       }

//       Resume: 
//       ${resumeText}
//     `;

//      const profileResult = await model.generateContent(
//       profilePrompt
//      );

//      const profileRaw = profileResult.response.text();

//      const profileClean = profileRaw.replace(/```json|```/g, "").trim();

//      const profile = JSON.parse(profileClean);
//      await ResumeProfile.findOneAndUpdate(
//       {
//         userId: req.user.id,
//       },
//       {
//         ...profile,
//         userId: req.user.id,
//       },
//       {
//         upsert: true,
//         new: true,
//       }

//      )

//     const prompt = `You are an ATS (Applicant Tracking System) expert.

// Compare this resume against the job description and respond ONLY with valid JSON.
// No markdown, no backticks, just raw JSON in this exact format:
// {
//   "matchScore": <number 0-100>,
//   "matchedKeywords": [<keywords found in both resume and JD>],
//   "missingKeywords": [<important keywords in JD but missing from resume>],
//   "suggestions": [<3-5 actionable tips to improve the resume for this JD>]
// }

// RESUME:
// ${resumeText}

// JOB DESCRIPTION:
// ${jobDescription}`;

//     // ✅ Change model in analyzeController.js
// // const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
//     const result = await model.generateContent(prompt);
//     const raw = result.response.text();

//     const clean = raw.replace(/```json|```/g, '').trim();
//     const parsed = JSON.parse(clean);

//     const saved = await Analysis.create({
//         userId: req.user.id,
//       resumeFileName: req.file.originalname,
//       jobDescription,
//       matchScore: parsed.matchScore,
//       matchedKeywords: parsed.matchedKeywords,
//       missingKeywords: parsed.missingKeywords,
//       suggestions: parsed.suggestions,
//     });

//     res.status(201).json({ success: true, data: saved });

//   } catch (err) {
//     console.error('analyzeResume error:', err.message);
//     res.status(500).json({ error: 'Analysis failed', details: err.message });
//   }
// };



// export const getHistory = async (req, res) => {
//   try {
//     const analyses = await Analysis.find({
//          userId: req.user.id
//     }).sort({ createdAt: -1 });

//     res.json({
//       success: true, 
//       data: analyses 
//     });

//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch history' });
//   }
// };


