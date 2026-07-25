import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractTextFromPDF = (buffer) => {
  return new Promise((resolve, reject) => {
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
    pdfParser.parseBuffer(buffer);
  });
};

export const analyzeResumeOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Resume PDF is required' });

    const resumeText = await extractTextFromPDF(req.file.buffer);
    if (!resumeText.trim()) return res.status(400).json({ error: 'Could not extract text from PDF.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const prompt = `
You are an expert resume reviewer, ATS specialist, and career coach with 15+ years experience.
Analyze this resume thoroughly and provide recruiter-level feedback that helps the candidate stand out.

Resume:
${resumeText}

Return ONLY valid JSON. No markdown. No explanation.
{
  "overallScore": <number 0-100>,
  "atsCompatibilityScore": <number 0-100>,
  "experienceLevel": "<Fresher/Junior/Mid-level/Senior>",
  
  "sectionScores": {
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "skills": <number 0-100>,
    "projects": <number 0-100>,
    "formatting": <number 0-100>
  },

  "strongPoints": ["<3-4 specific strong points>"],
  "weakPoints": ["<3-4 specific weak points>"],

  "detectedKeywords": ["<8-10 keywords found>"],
  "missingKeywords": ["<8-10 important missing keywords>"],

  "keywordDensity": [
    { "keyword": "<keyword>", "count": <number>, "importance": "<High/Medium/Low>" }
  ],

  "bulletImpactAnalysis": [
    { "original": "<original bullet>", "impact": "<Low/Medium/High>", "improved": "<improved version>" }
  ],

  "atsIssues": ["<formatting/ATS issues found>"],
  "atsGreenFlags": ["<ATS positive points>"],

  "skillGaps": ["<missing skills>"],
  "bestRoles": ["<3 best suited roles>"],

  "salaryEstimate": {
    "india": "<range in LPA>",
    "remote": "<range in USD/year>"
  },

  "careerTrajectory": [
    { "timeline": "<Now>", "role": "<current level>", "action": "<what they have>" },
    { "timeline": "<6 months>", "role": "<next level>", "action": "<what to add>" },
    { "timeline": "<1 year>", "role": "<senior level>", "action": "<what to achieve>" }
  ],

  "competitorComparison": {
    "hasSkills": ["<skills candidate has that market wants>"],
    "missingSkills": ["<skills market wants but candidate lacks>"],
    "uniqueStrengths": ["<unique things that make candidate stand out>"]
  },

  "suggestions": ["<5 actionable improvement tips>"],

  "recruiterVerdict": "<2-3 line honest recruiter opinion on this resume>"
}
    `;

    const result   = await model.generateContent(prompt);
    const raw      = result.response.text();
    const clean    = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(clean);

    res.status(200).json({ success: true, data: analysis });

  } catch (err) {
    console.error('analyzeResumeOnly error:', err.message);
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
};











// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const PDFParser = require('pdf2json');

// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const extractTextFromPDF = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new PDFParser();
//     pdfParser.on('pdfParser_dataError', (err) => reject(err.parserError));
//     pdfParser.on('pdfParser_dataReady', (pdfData) => {
//       const text = pdfData.Pages.map(page =>
//         page.Texts.map(t => {
//           try { return decodeURIComponent(t.R.map(r => r.T).join('')); }
//           catch { return t.R.map(r => r.T).join(''); }
//         }).join(' ')
//       ).join('\n');
//       resolve(text);
//     });
//     pdfParser.parseBuffer(buffer);
//   });
// };

// // POST /api/resume-analysis/analyze
// export const analyzeResumeOnly = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'Resume PDF is required' });
//     }

//     const resumeText = await extractTextFromPDF(req.file.buffer);
//     if (!resumeText.trim()) {
//       return res.status(400).json({ error: 'Could not extract text from PDF.' });
//     }

//     const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

//     const prompt = `
//       You are an expert resume reviewer and career coach.
//       Analyze this resume thoroughly and provide detailed feedback.
      
//       Resume:
//       ${resumeText}
      
//       Return ONLY valid JSON. No markdown. No explanation.
//       {
//         "overallScore": <number 0-100>,
//         "experienceLevel": "<Fresher/Junior/Mid-level/Senior>",
//         "strongPoints": ["<point1>", "<point2>", "<point3>"],
//         "weakPoints": ["<point1>", "<point2>", "<point3>"],
//         "missingKeywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
//         "detectedKeywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
//         "skillGaps": ["<skill1>", "<skill2>", "<skill3>"],
//         "bestRoles": ["<role1>", "<role2>", "<role3>"],
//         "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>", "<suggestion4>", "<suggestion5>"],
//         "sectionScores": {
//           "experience": <number 0-100>,
//           "education": <number 0-100>,
//           "skills": <number 0-100>,
//           "projects": <number 0-100>,
//           "formatting": <number 0-100>
//         }
//       }
//     `;

//     const result = await model.generateContent(prompt);
//     const raw    = result.response.text();
//     const clean  = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
//     const analysis = JSON.parse(clean);

//     res.status(200).json({ success: true, data: analysis });

//   } catch (err) {
//     console.error('analyzeResumeOnly error:', err.message);
//     res.status(500).json({ error: 'Analysis failed', details: err.message });
//   }
// };