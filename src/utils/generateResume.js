import fs from "fs";
import path from "path";
import latex from "node-latex";
import { Readable } from "stream";

const escapeLatex = (str) => {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\^/g, "\\^{}")
    .replace(/~/g, "\\~{}")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}");
};

export const generateResume = (data) => {
  const templatePath = path.join(process.cwd(), "src", "templates", "main.tex");
  let template = fs.readFileSync(templatePath, "utf-8");

  template = template.replace(/{{NAME}}/g,     escapeLatex(data.name));
  template = template.replace(/{{EMAIL}}/g,    escapeLatex(data.email));
  template = template.replace(/{{PHONE}}/g,    escapeLatex(data.phone));
  template = template.replace(/{{LINKEDIN}}/g, escapeLatex(data.linkedin));
  template = template.replace(/{{GITHUB}}/g,   escapeLatex(data.github));
  template = template.replace(/{{LEETCODE}}/g, escapeLatex(data.leetcode));  // ✅ NEW
  template = template.replace(/{{HEADLINE}}/g, escapeLatex(data.headline));

  template = template.replace(/{{EDUCATION}}/g,        data.education       || "");
  template = template.replace(/{{EXPERIENCE}}/g,       data.latexExperience || "");
  template = template.replace(/{{PROJECTS_SECTION}}/g,     data.projectsSection     || "");
  template = template.replace(/{{ACHIEVEMENTS_SECTION}}/g, data.achievementsSection || "");
  template = template.replace(/{{SKILLS}}/g,           data.latexSkills     || "");

  if (process.env.NODE_ENV !== "production") {
    fs.writeFileSync(path.join(process.cwd(), "debug.tex"), template);
  }

  const outputDir = path.join(process.cwd(), "src", "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `resume_${Date.now()}.pdf`);
  const output = fs.createWriteStream(outputPath);
  const input  = Readable.from(template);
  const pdf    = latex(input);

  pdf.pipe(output);

  return new Promise((resolve, reject) => {
    output.on("finish", () => resolve(outputPath));
    output.on("error",  (err) => reject(err));
    pdf.on("error",     (err) => reject(err));
  });
};




// import fs from "fs";
// import path from "path";
// import latex from "node-latex";
// import { Readable } from "stream";

// const escapeLatex = (str) => {
//   if (!str) return "";
//   return str
//     .replace(/\\/g, "\\textbackslash{}")
//     .replace(/&/g, "\\&")
//     .replace(/%/g, "\\%")
//     .replace(/\$/g, "\\$")
//     .replace(/#/g, "\\#")
//     .replace(/_/g, "\\_")
//     .replace(/\^/g, "\\^{}")
//     .replace(/~/g, "\\~{}")
//     .replace(/\{/g, "\\{")
//     .replace(/\}/g, "\\}");
// };

// export const generateResume = (data) => {
//   const templatePath = path.join(process.cwd(), "src", "templates", "main.tex");
//   let template = fs.readFileSync(templatePath, "utf-8");

//   template = template.replace(/{{NAME}}/g, escapeLatex(data.name));
//   template = template.replace(/{{EMAIL}}/g, escapeLatex(data.email));
//   template = template.replace(/{{PHONE}}/g, escapeLatex(data.phone));
//   template = template.replace(/{{LINKEDIN}}/g, escapeLatex(data.linkedin));
//   template = template.replace(/{{GITHUB}}/g, escapeLatex(data.github));
//   template = template.replace(/{{HEADLINE}}/g, escapeLatex(data.headline));

//   template = template.replace(/{{EDUCATION}}/g, data.education || "");
//   template = template.replace(/{{EXPERIENCE}}/g, data.latexExperience || "");
//   template = template.replace(/{{PROJECTS_SECTION}}/g, data.projectsSection || ""); // ✅ changed
//   template = template.replace(/{{SKILLS}}/g, data.latexSkills || "");

//   if (process.env.NODE_ENV !== "production") {
//     fs.writeFileSync(path.join(process.cwd(), "debug.tex"), template);
//   }

//   const outputDir = path.join(process.cwd(), "src", "output");
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//   }

//   const outputPath = path.join(outputDir, `resume_${Date.now()}.pdf`);
//   const output = fs.createWriteStream(outputPath);
//   const input = Readable.from(template);
//   const pdf = latex(input);

//   pdf.pipe(output);

//   return new Promise((resolve, reject) => {
//     output.on("finish", () => resolve(outputPath));
//     output.on("error", (err) => reject(err));
//     pdf.on("error", (err) => reject(err));
//   });
// };






// import fs from "fs";
// import path from "path";
// import latex from "node-latex";
// import {Readable} from "stream";



// const escapeLatex = (str) => {
//   if (!str) return "";
//   return str
//     .replace(/\\/g, "\\textbackslash{}")
//     .replace(/&/g, "\\&")
//     .replace(/%/g, "\\%")
//     .replace(/\$/g, "\\$")
//     .replace(/#/g, "\\#")
//     .replace(/_/g, "\\_")
//     .replace(/\^/g, "\\^{}")
//     .replace(/~/g, "\\~{}")
//     .replace(/\{/g, "\\{")
//     .replace(/\}/g, "\\}");
// };

// export const generateResume = (data) => {
  
//   const templatePath = path.join(
//     process.cwd(),
//     "src",
//     "templates",
//     "main.tex"
//   );

//   let template = fs.readFileSync(templatePath, "utf-8");

 

//   template = template.replace(/{{NAME}}/g, escapeLatex(data.name));
//   template = template.replace(/{{EMAIL}}/g, escapeLatex(data.email));
//   template = template.replace(/{{PHONE}}/g, escapeLatex(data.phone));
//   template = template.replace(/{{LINKEDIN}}/g, escapeLatex(data.linkedin));
//   template = template.replace(/{{GITHUB}}/g, escapeLatex(data.github));
//   template = template.replace(/{{HEADLINE}}/g, escapeLatex(data.headline));


//   template = template.replace(/{{EDUCATION}}/g, data.education || "");
//   template = template.replace(/{{EXPERIENCE}}/g, data.latexExperience || "");
//   // template = template.replace(/{{PROJECTS}}/g, data.latexProjects || "");
//   template = template.replace(/{{PROJECTS_SECTION}}/g, data.projectsSection || "");
//   template = template.replace(/{{SKILLS}}/g, data.latexSkills || "");

// //      fs.writeFileSync(
// //   path.join(process.cwd(), "debug.tex"),
// //   template
// // );

//   // Debug ke liye .tex file save karo (production mein band kar do)
//   if (process.env.NODE_ENV !== "production") {
//     fs.writeFileSync(path.join(process.cwd(), "debug.tex"), template);
//   }

//   // const outputPath = path.join(
//   //   process.cwd(),
//   //   "src",
//   //   "output",
//   //   "resume.pdf"
//   // );

//   const outputDir = path.join(
//     process.cwd(),
//     "src",
//     "output"
//   );

//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//   }

//   const outputPath = path.join(outputDir, `resume_${Date.now()}.pdf`);
//   const output = fs.createWriteStream(outputPath);

//   const input = Readable.from(template);
//   const pdf = latex(input);

//   pdf.pipe(output);
 


//   // const output = fs.createWriteStream(outputPath);
//   // const pdf = latex(template);

//   // pdf.pipe(output);

//   return new Promise((resolve, reject) => {
//     output.on("finish", () => {
//       resolve(outputPath);
//     });
//     output.on("error", (err) => {
//       reject(err);
//     });
    
//     pdf.on("error", (err) => {
//       reject(err);
//     });
//   });
// };