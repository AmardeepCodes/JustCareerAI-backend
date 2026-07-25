// import pdf from 'pdf-parse/lib/pdf-parse.js'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { getGeminiClient } from "./gemini.js"

const client = getGeminiClient();

export async function compareResumeWithJob(pdfBuffer, jobDescription){

    const pdfData = await pdf(pdfBuffer);
    const resumeText = pdfData.text;

   const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
   const prompt = `You are a resume analyzer. Compare the resume below against the job description and identify what is MISSING or WEAK in the resume.

Return your response as JSON with this exact shape:
{
  "missingSkills": ["skill1", "skill2"],
  "missingExperience": ["item1", "item2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "matchScore": 72
}

Only return the JSON object. No extra text.

--- RESUME ---
${resumeText}

--- JOB DESCRIPTION ---
${jobDescription}`;

   const response = await model.generateContent(prompt);
   const raw = response.response.text();
   return JSON.parse(raw);
}
