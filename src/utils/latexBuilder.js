// src/utils/latexBuilder.js

const latexEscape = (text = "") => {
  if (!text) return "";
  return String(text)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
};

// ─── SKILLS ───────────────────────────────────────────────────────────────────
// skills object se categorized LaTeX banao
export const buildSkills = (skills = {}) => {
  // Agar purana flat array aaya toh handle karo
  if (Array.isArray(skills)) {
    const safeSkills = skills.map(latexEscape).join(", ");
    return `\\item \\textbf{Skills}{: ${safeSkills}}`;
  }

  const categoryMap = {
    languages:     "Languages",
    backend:       "Backend",
    databases:     "Databases",
    tools:         "Tools \\& DevOps",
    devops:        "DevOps",
    coreConcepts:  "Core Concepts",
  };

  const lines = Object.entries(categoryMap)
    .filter(([key]) => skills[key]?.length > 0)
    .map(([key, label]) => {
      const values = skills[key].map(latexEscape).join(", ");
      return `\\textbf{${label}}{: ${values}}`;
    })
    .join(" \\\\\n    ");

  return `\\item{${lines}}`;
};

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────
export const buildExperience = (experience = []) => {
  return (experience || [])
    .map((exp) => {
      const bullets = (exp.bullets || [])
        .map(bullet => `  \\resumeItem{${latexEscape(bullet)}}`)
        .join("\n");

      return `\\resumeSubheading
{${latexEscape(exp.company)}}
{${latexEscape(exp.duration)}}
{${latexEscape(exp.position || "")}}
{${latexEscape(exp.location || "")}}
\\resumeItemListStart
${bullets}
\\resumeItemListEnd`;
    })
    .join("\n\n");
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
// description string ko bullets mein split karo (. ya \n se)
export const buildProjects = (projects = []) => {
  return (projects || [])
    .map((project) => {
      const tech = Array.isArray(project.techStack) && project.techStack.length
        ? project.techStack.map(latexEscape).join(", ")
        : "";

      const techLine = tech
        ? ` $|$ \\emph{${tech}}`
        : "";

      const duration = project.duration
        ? latexEscape(project.duration)
        : "";

      // Description ko bullets mein convert karo
      let bullets = "";
      if (Array.isArray(project.bullets) && project.bullets.length > 0) {
        // Agar AI ne bullets array diya
        bullets = project.bullets
          .map(b => `  \\resumeItem{${latexEscape(b)}}`)
          .join("\n");
      } else if (project.description) {
        // Description string ko sentences mein split karo
        const sentences = project.description
          .split(/(?<=[.!?])\s+/)
          .filter(s => s.trim().length > 0);

        bullets = sentences
          .map(s => `  \\resumeItem{${latexEscape(s.trim())}}`)
          .join("\n");
      }

      return `\\resumeProjectHeading
{\\textbf{${latexEscape(project.title)}}${techLine}}
{${duration}}
\\resumeItemListStart
${bullets}
\\resumeItemListEnd`;
    })
    .join("\n\n");
};

// ─── ACHIEVEMENTS ────────────────────────────────────────────────────────────


export const buildAchievements = (achievements = []) => {
  return (achievements || [])
    .map((ach) => `\\resumeSubheading
{${latexEscape(ach.title || "")}}
{${latexEscape(ach.duration || "")}}
{}{}
\\resumeItemListStart
  \\resumeItem{${latexEscape(ach.description || "")}}
\\resumeItemListEnd`)
    .join("\n\n");
};


// export const buildAchievements = (achievements = []) => {
//   return (achievements || [])
//     .map((ach) => `\\resumeSubheading
// {${latexEscape(ach.title || "")}}
// {${latexEscape(ach.duration || "")}}
// {}{}
// \\resumeItemListStart
//   \\resumeItem{${latexEscape(ach.description || "")}}
// \\resumeItemListEnd`)
//     .join("\n\n");
// };





// ─── EDUCATION ────────────────────────────────────────────────────────────────
export const buildEducation = (education = []) => {
  return (education || [])
    .map(
      (edu) => `
\\resumeSubheading
{${latexEscape(edu.institution || "")}}
{${latexEscape(edu.duration || "")}}
{${latexEscape(edu.degree || "")}${edu.fieldOfStudy ? ` in ${latexEscape(edu.fieldOfStudy)}` : ""}}
{}
`
    )
    .join("\n");
};













// // src/utils/latexBuilder.js

// const latexEscape = (text = "") => {
//   if (!text) return "";
//   return String(text)
//     .replace(/\\/g, "\\textbackslash{}")
//     .replace(/&/g, "\\&")
//     .replace(/%/g, "\\%")
//     .replace(/\$/g, "\\$")
//     .replace(/#/g, "\\#")
//     .replace(/_/g, "\\_")
//     .replace(/{/g, "\\{")
//     .replace(/}/g, "\\}")
//     .replace(/~/g, "\\textasciitilde{}")
//     .replace(/\^/g, "\\textasciicircum{}");
// };

// // ─── SKILLS ───────────────────────────────────────────────────────────────────
// // skills object se categorized LaTeX banao
// export const buildSkills = (skills = {}) => {
//   // Agar purana flat array aaya toh handle karo
//   if (Array.isArray(skills)) {
//     const safeSkills = skills.map(latexEscape).join(", ");
//     return `\\item \\textbf{Skills}{: ${safeSkills}}`;
//   }

//   const categoryMap = {
//     languages:     "Languages",
//     backend:       "Backend",
//     databases:     "Databases",
//     tools:         "Tools \\& DevOps",
//     devops:        "DevOps",
//     coreConcepts:  "Core Concepts",
//   };

//   const lines = Object.entries(categoryMap)
//     .filter(([key]) => skills[key]?.length > 0)
//     .map(([key, label]) => {
//       const values = skills[key].map(latexEscape).join(", ");
//       return `\\textbf{${label}}{: ${values}}`;
//     })
//     .join(" \\\\\n    ");

//   return `\\item{${lines}}`;
// };

// // ─── EXPERIENCE ───────────────────────────────────────────────────────────────
// export const buildExperience = (experience = []) => {
//   return (experience || [])
//     .map((exp) => {
//       const bullets = (exp.bullets || [])
//         .map(bullet => `  \\resumeItem{${latexEscape(bullet)}}`)
//         .join("\n");

//       return `\\resumeSubheading
// {${latexEscape(exp.company)}}
// {${latexEscape(exp.duration)}}
// {${latexEscape(exp.position || "")}}
// {${latexEscape(exp.location || "")}}
// \\resumeItemListStart
// ${bullets}
// \\resumeItemListEnd`;
//     })
//     .join("\n\n");
// };

// // ─── PROJECTS ─────────────────────────────────────────────────────────────────
// // description string ko bullets mein split karo (. ya \n se)
// export const buildProjects = (projects = []) => {
//   return (projects || [])
//     .map((project) => {
//       const tech = Array.isArray(project.techStack) && project.techStack.length
//         ? project.techStack.map(latexEscape).join(", ")
//         : "";

//       const techLine = tech
//         ? ` $|$ \\emph{${tech}}`
//         : "";

//       const duration = project.duration
//         ? latexEscape(project.duration)
//         : "";

//       // Description ko bullets mein convert karo
//       let bullets = "";
//       if (Array.isArray(project.bullets) && project.bullets.length > 0) {
//         // Agar AI ne bullets array diya
//         bullets = project.bullets
//           .map(b => `  \\resumeItem{${latexEscape(b)}}`)
//           .join("\n");
//       } else if (project.description) {
//         // Description string ko sentences mein split karo
//         const sentences = project.description
//           .split(/(?<=[.!?])\s+/)
//           .filter(s => s.trim().length > 0);

//         bullets = sentences
//           .map(s => `  \\resumeItem{${latexEscape(s.trim())}}`)
//           .join("\n");
//       }

//       return `\\resumeProjectHeading
// {\\textbf{${latexEscape(project.title)}}${techLine}}
// {${duration}}
// \\resumeItemListStart
// ${bullets}
// \\resumeItemListEnd`;
//     })
//     .join("\n\n");
// };

// // ─── EDUCATION ────────────────────────────────────────────────────────────────
// export const buildEducation = (education = []) => {
//   return (education || [])
//     .map(
//       (edu) => `
// \\resumeSubheading
// {${latexEscape(edu.institution || "")}}
// {${latexEscape(edu.duration || "")}}
// {${latexEscape(edu.degree || "")}${edu.fieldOfStudy ? ` in ${latexEscape(edu.fieldOfStudy)}` : ""}}
// {}
// `
//     )
//     .join("\n");
// };







// src/utils/latexBuilder.js

// const latexEscape = (text = "") => {
//   if (!text) return "";
//   return String(text)
//     .replace(/\\/g, "\\textbackslash{}")
//     .replace(/&/g, "\\&")
//     .replace(/%/g, "\\%")
//     .replace(/\$/g, "\\$")
//     .replace(/#/g, "\\#")
//     .replace(/_/g, "\\_")
//     .replace(/{/g, "\\{")
//     .replace(/}/g, "\\}")
//     .replace(/~/g, "\\textasciitilde{}")
//     .replace(/\^/g, "\\textasciicircum{}");
// };

// export const buildSkills = (skills = []) => {
//   const safeSkills = (skills || [])
//     .map(skill => latexEscape(skill))
//     .join(", ");

//   return `\\item \\textbf{Skills}: ${safeSkills}`;
// };

// export const buildExperience = (experience = []) => {
//   return (experience || [])
//     .map((exp) => {
//       const bullets = (exp.bullets || [])
//         .map(bullet => `  \\resumeItem{${latexEscape(bullet)}}`)
//         .join("\n");

//       return `\\resumeSubheading
// {${latexEscape(exp.company)}}
// {${latexEscape(exp.duration)}}
// {${latexEscape(exp.position || "")}}
// {${latexEscape(exp.location || "")}}
// \\resumeItemListStart
// ${bullets}
// \\resumeItemListEnd`;
//     })
//     .join("\n\n");
// };

// export const buildProjects = (projects = []) => {
//   return (projects || [])
//     .map((project) => {
//       // techStack array ko comma-separated string bana do
//       const tech = Array.isArray(project.techStack) && project.techStack.length
//         ? project.techStack.map(latexEscape).join(", ")
//         : "";

//       const techLine = tech
//         ? ` \\textbar{} \\textit{\\small{${tech}}}`
//         : "";

//       const duration = project.duration
//         ? latexEscape(project.duration)
//         : "";

//       return `\\resumeProjectHeading
// {\\textbf{${latexEscape(project.title)}}${techLine}}
// {${duration}}
// \\resumeItemListStart
//   \\resumeItem{${latexEscape(project.description)}}
// \\resumeItemListEnd`;
//     })
//     .join("\n\n");
// };

// export const buildEducation = (education = []) => {
//   return (education || [])
//     .map(
//       (edu) => `
// \\resumeSubheading
// {${latexEscape(edu.institution || "")}}
// {${latexEscape(edu.duration || "")}}
// {${latexEscape(edu.degree || "")}${edu.fieldOfStudy ? ` in ${latexEscape(edu.fieldOfStudy)}` : ""}}
// {}
// `
//     )
//     .join("\n");
// };

















// const latexEscape = (text = "") => {
//   if (!text) return "";
//   return String(text)
//     .replace(/\\/g, "\\textbackslash{}")
//     .replace(/&/g, "\\&")
//     .replace(/%/g, "\\%")
//     .replace(/\$/g, "\\$")
//     .replace(/#/g, "\\#")
//     .replace(/_/g, "\\_")
//     .replace(/{/g, "\\{")
//     .replace(/}/g, "\\}")
//     .replace(/~/g, "\\textasciitilde{}")
//     .replace(/\^/g, "\\textasciicircum{}");
// };



// export const buildSkills = (skills = []) => {
//   const safeSkills = (skills || [])
//     .map(skill => latexEscape(skill))
//     .join(", ");

// return `\\item \\textbf{Skills}: ${safeSkills}`;
// };



// export const buildExperience = (experience = []) => {
//   return (experience || [])
//     .map((exp) => {
//       const bullets = (exp.bullets || [])
//         .map(bullet => `  \\resumeItem{${latexEscape(bullet)}}`)
//         .join("\n");

//       return `\\resumeSubheading
// {${latexEscape(exp.company)}}
// {${latexEscape(exp.duration)}}
// {}{ }
// \\resumeItemListStart
// ${bullets}
// \\resumeItemListEnd`;
//     })
//     .join("\n\n");
// };

// export const buildProjects = (projects = []) => {
//   return (projects || [])
//     .map((project) => `\\resumeProjectHeading
// {\\textbf{${latexEscape(project.title)}}}{}
// \\resumeItemListStart
//   \\resumeItem{${latexEscape(project.description)}}
// \\resumeItemListEnd`)
//     .join("\n\n");
// };


// export const buildEducation = (education = []) => {
//   return education
//     .map(
//       (edu) => `
// \\resumeSubheading
// {${edu.institution || ""}}
// {${edu.duration || ""}}
// {${edu.degree || ""}}
// {}
// `
//     )
//     .join("\n");
// };






// export const buildEducation = (education = []) => {
//   return (education || [])
//     .map((edu) => `\\resumeSubheading
// {${latexEscape(edu.institution || edu.institute || "")}}
// {${latexEscape(edu.duration || "")}}
// {${latexEscape(edu.degree || "")}}
// {}`)
//     .join("\n\n");
// };















// src/utils/latexBuilder.js




// export const buildSkills = (skills = []) => {
//   return `
// \\item{
// \\textbf{Skills}{: ${skills.join(", ")}}
// }
// `;
// };

// export const buildExperience = (experience = []) => {
//   return experience
//     .map(
//       (exp) => `
// \\resumeSubheading
// {${exp.company || ""}}
// {${exp.duration || ""}}
// {}{ }

// \\resumeItemListStart

// ${(exp.bullets || [])
//   .map(
//     (bullet) =>
//       `\\resumeItem{${bullet
//         .replace(/&/g, "\\&")
//         .replace(/%/g, "\\%")}}`
//   )
//   .join("\n")}

// \\resumeItemListEnd
// `
//     )
//     .join("\n");
// };

// export const buildProjects = (projects = []) => {
//   return projects
//     .map(
//       (project) => `
// \\resumeProjectHeading
// {\\textbf{${project.title || ""}}}{}

// \\resumeItemListStart

// \\resumeItem{${(project.description || "")
//   .replace(/&/g, "\\&")
//   .replace(/%/g, "\\%")}}

// \\resumeItemListEnd
// `
//     )
//     .join("\n");
// };

// export const buildEducation = (education = []) => {
//   return education
//     .map(
//       (edu) => `
// \\resumeSubheading
// {${edu.institution || edu.institute || ""}}
// {${edu.duration || ""}}
// {${edu.degree || ""}}
// {}
// `
//     )
//     .join("\n");
// };