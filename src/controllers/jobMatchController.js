
import ResumeProfile from "../models/ResumeProfile.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";



const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is missing');
}

const genAI = new GoogleGenerativeAI(apiKey);


const getModel = () => genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

const jsearchGet = (query) =>
  axios.get("https://jsearch.p.rapidapi.com/search-v2", {
    params: { query, num_pages: "1" },
    headers: {
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
      "x-rapidapi-key":  process.env.JSEARCH_API_KEY,
    },
  });



export const getJobMatches = async (req, res) => {
  try {
    // Step 1: Profile fetch karo
    const profile = await ResumeProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Pehle resume upload karo." });
    }

    // Step 2: AI se job titles nikalo
    const model = getModel();
    const prompt = `
      Based on this candidate profile, suggest TOP 3 relevant job titles and 5 keywords.
      Profile:
      - Skills: ${JSON.stringify(profile.skills)}
      - Experience: ${profile.experience?.map(e => e.position).join(", ")}
      - Education: ${profile.education?.map(e => e.degree).join(", ")}
      Return ONLY valid JSON. No markdown.
      { "jobTitles": ["", "", ""], "keywords": ["", "", "", "", ""] }
    `;

    const result  = await model.generateContent(prompt);
    const raw     = result.response.text();
    const clean   = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed  = JSON.parse(clean);

    const jobTitles   = parsed.jobTitles || ["Software Engineer"];
    const keywords    = parsed.keywords  || [];
    const searchQuery = jobTitles[0];

    console.log("Search Query:", searchQuery);

    // Step 3: India + Remote jobs parallel fetch karo
    const [indiaRes, remoteRes] = await Promise.all([
      jsearchGet(`${searchQuery} Bangalore OR Mumbai OR Delhi OR Hyderabad`),
      jsearchGet(`${searchQuery} remote`),
    ]);

    console.log("Raw Response:", JSON.stringify(indiaRes.data).substring(0, 500));

    const indiaJobs  = Array.isArray(indiaRes.data.data)  ? indiaRes.data.data.jobs  : [];
    const remoteJobs = Array.isArray(remoteRes.data.data) ? remoteRes.data.data.jobs : [];

    console.log("India jobs:", indiaJobs.length, "Remote jobs:", remoteJobs.length);

    // Combine + duplicates remove karo
    const allJobs = [...indiaJobs, ...remoteJobs]
      .filter((job, index, self) =>
        index === self.findIndex(j => j.job_id === job.job_id)
      )
      .slice(0, 15);

    const jobs = allJobs.map(job => ({
      id:             job.job_id,
      title:          job.job_title,
      company:        job.employer_name,
      location:       job.job_is_remote
                        ? "Remote"
                        : job.job_city
                        ? `${job.job_city}, ${job.job_country}`
                        : "Not specified",
      salary:         job.job_min_salary && job.job_max_salary
                        ? `${job.job_salary_currency || "$"}${Math.round(job.job_min_salary/1000)}k - ${Math.round(job.job_max_salary/1000)}k`
                        : "Not disclosed",
      description:    job.job_description?.substring(0, 200) + "...",
      applyUrl:       job.job_apply_link,
      employmentType: job.job_employment_type || "Full-time",
      isRemote:       job.job_is_remote || false,
      logo:           job.employer_logo,
    }));

    return res.status(200).json({ success: true, jobTitles, keywords, jobs });

  } catch (error) {
    console.error("getJobMatches error:", error.message);
    console.error("Error details:", error.response?.data);
    res.status(500).json({ success: false, message: "Failed to fetch job matches" });
  }
};













// import ResumeProfile from "../models/ResumeProfile.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import axios from "axios";

// const genAI = new GoogleGenerativeAI("AQ.Ab8RN6KtUIDofm6Ysp68xW6TOn6W2C3zuRYKWcqEQqG8OC0qEw");
// const getModel = () => genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

// export const getJobMatches = async (req, res) => {
//   try {
//     // Step 1: Profile fetch karo
//     const profile = await ResumeProfile.findOne({ userId: req.user.id });
//     if (!profile) {
//       return res.status(404).json({ message: "Profile not found. Pehle resume upload karo." });
//     }

//     // Step 2: AI se job titles nikalo
//     const model = getModel();
//     const prompt = `
//       Based on this candidate profile, suggest TOP 3 relevant job titles and 5 keywords.
//       Profile:
//       - Skills: ${JSON.stringify(profile.skills)}
//       - Experience: ${profile.experience?.map(e => e.position).join(", ")}
//       - Education: ${profile.education?.map(e => e.degree).join(", ")}
//       Return ONLY valid JSON. No markdown.
//       { "jobTitles": ["", "", ""], "keywords": ["", "", "", "", ""] }
//     `;

//     const result  = await model.generateContent(prompt);
//     const raw     = result.response.text();
//     const clean   = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
//     const parsed  = JSON.parse(clean);
    
//     const jobTitles = parsed.jobTitles || ["Software Engineer"];
//     const keywords  = parsed.keywords  || [];
//     const searchQuery = jobTitles[0];

//     console.log("Job Titles:", jobTitles);
//     console.log("Search Query:", searchQuery);

//     // Step 3: JSearch se jobs fetch karo
//    const jsearchRes = await axios.get(
//             "https://jsearch.p.rapidapi.com/search-v2",
//             {
//                 params: {
//                 query: `${searchQuery} Bangalore OR Mumbai OR Delhi OR Hyderabad`,
//                 num_pages: "1",
//                 },
//                 headers: {
//                 "x-rapidapi-host": "jsearch.p.rapidapi.com",
//                 "x-rapidapi-key":  process.env.JSEARCH_API_KEY,
//                 },
//             }
//      )

//      console.log("API Response:", JSON.stringify(jsearchRes.data).substring(0, 500));

//         const jobsData = Array.isArray(jsearchRes.data.data) 
//         ? jsearchRes.data.data 
//         : Array.isArray(jsearchRes.data.jobs)
//         ? jsearchRes.data.jobs
//         : Array.isArray(jsearchRes.data)
//         ? jsearchRes.data
//         : [];

//      const jobs = jobsData.slice(0, 10).map(job => ({
//         id:             job.job_id,
//         title:          job.job_title,
//         company:        job.employer_name,
//         location:       job.job_city ? `${job.job_city}, ${job.job_country}` : "Remote",
//         salary:         job.job_min_salary && job.job_max_salary
//                             ? `₹${Math.round(job.job_min_salary/1000)}k - ₹${Math.round(job.job_max_salary/1000)}k`
//                             : "Not disclosed",
//         description:    job.job_description?.substring(0, 200) + "...",
//         applyUrl:       job.job_apply_link,
//         employmentType: job.job_employment_type || "Full-time",
//         logo:           job.employer_logo,
//         }));

    

//     return res.status(200).json({ success: true, jobTitles, keywords, jobs });

//   } catch (error) {
//     console.error("getJobMatches error:", error.message);
//     console.error("Error details:", error.response?.data);
//     res.status(500).json({ success: false, message: "Failed to fetch job matches" });
//   }
// };








