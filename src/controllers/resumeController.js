import ResumeProfile from "../models/ResumeProfile.js";
import { generateResume } from "../utils/generateResume.js";
import {
  buildSkills,
  buildExperience,
  buildProjects,
  buildEducation,
  buildAchievements,
} from "../utils/latexBuilder.js";


import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');

import { GoogleGenerativeAI } from "@google/generative-ai";
// import pdfParse from "pdf-parse";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is missing');
}

const genAI = new GoogleGenerativeAI(apiKey);


const getModel = () => genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/resume/profile
// ─────────────────────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const profile = await ResumeProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ exists: false });
    return res.status(200).json({ exists: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/resume/upload
// Basic info + PDF → extract → MongoDB save
// ─────────────────────────────────────────────────────────────────────────────
export const uploadAndSaveProfile = async (req, res) => {
  try {
    const { name, email, phone, linkedin, github, leetcode } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "name, email aur phone required hain" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Resume PDF required hai" });
    }

    // PDF se text extract karo
    // const pdfData    = await pdfParse(req.file.buffer);
    // const resumeText = pdfData.text;

    const resumeText = await new Promise((resolve, reject) => {
  const pdfParser = new PDFParser();
  pdfParser.on('pdfParser_dataError', (err) => reject(err.parserError));
  pdfParser.on('pdfParser_dataReady', (pdfData) => {
    const text = pdfData.Pages.map(page =>
      page.Texts.map(t => {
        try { return decodeURIComponent(t.R.map(r => r.T).join('')); }
        catch { return t.R.map(r => r.T).join(''); }
      }).join(' ')
    ).join('\n');
    resolve(text);
  });
  pdfParser.parseBuffer(req.file.buffer);
});

    // AI se structured data extract karo
    const model = getModel();
    const extractPrompt = `
      Extract structured data from this resume text.
      Return ONLY valid JSON. No explanation. No markdown.
      {
        "education":    [{ "institution": "", "degree": "", "fieldOfStudy": "", "duration": "" }],
        "experience":   [{ "company": "", "position": "", "location": "", "duration": "", "bullets": [] }],
        "projects":     [{ "title": "", "description": "", "techStack": [], "duration": "" }],
        "skills": {
          "languages": [], "backend": [], "databases": [],
          "tools": [], "devops": [], "coreConcepts": []
        },
        "achievements": [{ "title": "", "description": "", "duration": "" }]
      }
      Resume: ${resumeText}
    `;



    const extractResult = await model.generateContent(extractPrompt);
    const raw           = extractResult.response.text();
    const clean         = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const extracted     = JSON.parse(clean);

    const profile = await ResumeProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          name, email, phone,
          linkedin:     linkedin || "",
          gitHub:       github   || "",
          leetcode:     leetcode || "",
          education:    extracted.education    || [],
          experience:   extracted.experience   || [],
          projects:     extracted.projects     || [],
          skills:       extracted.skills       || {},
          achievements: extracted.achievements || [],
        },
      },
      { new: true, upsert: true }
    );

    // console.log("pdfParse type:", typeof pdfParse);
    // console.log("pdfParseLib:", typeof pdfParseLib);

    return res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error("uploadAndSaveProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to save profile" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/resume/generate
// ─────────────────────────────────────────────────────────────────────────────
export const generateATSResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription?.trim()) {
      return res.status(400).json({ error: "Job Description is required" });
    }

    const profile = await ResumeProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please upload your resume first." });
    }

    const model  = getModel();
    const prompt = `
You are an elite ATS resume writer. Produce a SINGLE PAGE resume that fills
exactly one full page — no more, no less. Every line must count.

Candidate Profile:
${JSON.stringify(profile)}

Job Description:
${jobDescription}

STRICT RULES:

1. EDUCATION — Never invent. Use exactly what candidate provided.

2. EXPERIENCE — 4 to 5 bullets per company. Each bullet:
   - Strong action verb + specific metric + ATS keyword from JD
   - 12-18 words long
   - Never invent company names
   - If only 1 company → write 5-6 bullets

3. PROJECTS — 3 to 4 bullets per project.
   - Minimum 2 projects required
   - If fewer than 2 → generate realistic ones using ONLY candidate's existing skills

4. SKILLS — maximize relevant skills from JD.
   Categorize into: languages, backend, databases, tools, devops, coreConcepts.
   Each category minimum 3-4 items.

5. ACHIEVEMENTS — exactly 2, with 2-3 line descriptions each.
   - If no achievements → generate realistic ones using candidate's actual
     college name, company names. Never generic.

6. HEADLINE — 8-10 word professional headline matching JD role.

7. SPACE FILLING (CRITICAL):
   - 1 company → 5-6 bullets experience + 4 bullets projects
   - 2 companies → 4-5 bullets experience + 3-4 bullets projects
   - Skills: minimum 5 categories with 4+ items each
   - Resume must fill full page — no blank space

Return ONLY valid JSON. No explanation. No markdown.

{
  "headline": "",
  "skills": {
    "languages": [], "backend": [], "databases": [],
    "tools": [], "devops": [], "coreConcepts": []
  },
  "experience": [{ "company": "", "position": "", "location": "", "duration": "", "bullets": [] }],
  "projects":   [{ "title": "", "techStack": [], "duration": "", "bullets": [] }],
  "education":  [{ "institution": "", "degree": "", "fieldOfStudy": "", "duration": "" }],
  "achievements": [{ "title": "", "description": "", "duration": "" }]
}
    `;

    const result = await model.generateContent(prompt);
    const raw    = result.response.text();
    const clean  = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    let optimized;
    try {
      optimized = JSON.parse(clean);
    } catch {
      return res.status(500).json({ success: false, message: "AI returned invalid JSON. Try again." });
    }

    const latexSkills       = buildSkills(optimized.skills || {});
    const latexExperience   = buildExperience(optimized.experience || []);
    const latexProjects     = buildProjects(optimized.projects || []);
    const latexAchievements = buildAchievements(optimized.achievements || []);
    const latexEducation    = optimized.education?.length
      ? buildEducation(optimized.education)
      : buildEducation(profile.education);

    const projectsSection = optimized.projects?.length > 0
      ? `\\section{Projects}\n\\resumeSubHeadingListStart\n${latexProjects}\n\\resumeSubHeadingListEnd`
      : "";

    const achievementsSection = optimized.achievements?.length > 0
      ? `\\section{Achievements \\& Activities}\n\\resumeSubHeadingListStart\n${latexAchievements}\n\\resumeSubHeadingListEnd`
      : "";

    let pdfPath;
    try {
      pdfPath = await generateResume({
        name:     profile.name,
        email:    profile.email,
        phone:    profile.phone,
        linkedin: profile.linkedin || "",
        github:   profile.gitHub   || "",
        leetcode: profile.leetcode || "",
        headline: optimized.headline || "",
        education: latexEducation,
        latexExperience,
        projectsSection,
        achievementsSection,
        latexSkills,
      });
    } catch (pdfError) {
      return res.status(500).json({ success: false, message: "PDF generation failed", error: pdfError.message });
    }

    return res.sendFile(pdfPath);

  } catch (error) {
    console.error("generateATSResume error:", error);
    res.status(500).json({ success: false, message: "Failed to generate ATS resume" });
  }
};

