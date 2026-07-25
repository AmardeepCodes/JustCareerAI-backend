import mongoose from 'mongoose';

const resumeProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    name: String,
    email: String,
    phone: String,
    linkedin: String,
    gitHub: String,
    leetcode: String,

    lastJobDescription: String,  // ✅ NEW — ATS check ka JD save hoga

    education: [
        {
            institution: String,
            degree: String,
            fieldOfStudy: String,
            duration: String,
        },
    ],

    experience: [
        {
            company: String,
            position: String,
            location: String,
            duration: String,
            bullets: [String],
        },
    ],

    projects: [
        {
            title: String,
            description: String,
            techStack: [String],
            duration: String,
        },
    ],

    skills: {
        languages:    [String],
        backend:      [String],
        databases:    [String],
        tools:        [String],
        devops:       [String],
        coreConcepts: [String],
    },

    achievements: [
        {
            title: String,
            description: String,
            duration: String,
        },
    ],
},
{
    timestamps: true,
}
);

export default mongoose.model('ResumeProfile', resumeProfileSchema);




// import mongoose from 'mongoose';

// const resumeProfileSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//         unique: true
//     },

//     name: String,
//     email: String,
//     phone: String,
//     linkedin: String,
//     gitHub: String,
//     leetcode: String,

//     education: [
//         {
//             institution: String,
//             degree: String,
//             fieldOfStudy: String,
//             duration: String,
//         },
//     ],

//     experience: [
//         {
//             company: String,
//             position: String,
//             location: String,
//             duration: String,
//             bullets: [String],
//         },
//     ],

//     projects: [
//         {
//             title: String,
//             description: String,  
//             techStack: [String],
//             duration: String,
//         },
//     ],

//      skills: {
//         languages:    [String],   // Java, Python, C++
//         backend:      [String],   // Node.js, Express, REST APIs
//         databases:    [String],   // MongoDB, PostgreSQL, MySQL
//         tools:        [String],   // Git, Docker, AWS
//         devops:       [String],   // CI/CD, Jenkins, GitHub Actions
//         coreConceptes: [String],  // DSA, OOP, Microservices, System Design
//     },

//      achievements: [
//         {
//             title: String,       // "Hackathon Winner", "Open Source Contributor"
//             description: String, // what you did / achieved
//             duration: String,    // "2025", "Jan 2025"
//         },
//     ],
// },
// {
//     timestamps: true,
// }
// );

// export default mongoose.model('ResumeProfile', resumeProfileSchema);






// import mongoose from 'mongoose';

// const resumeProfileSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//         unique: true
//     },

//     name: String,
//     email: String,
//     phone: String,
//     linkedin: String,
//     gitHub: String,
//     leetcode: String,

//     education: [
//         {
//             institution: String,
//             degree: String,
//             fieldOfStudy: String,
//             duration: String,
//         },
//     ],

//     experience: [
//         {
//             company: String,
//             position: String,
//             location: String,
//             duration: String,
//             bullets: [String],
//         },
//     ],

//     projects: [
//         {
//             title: String,
//             description: String,  
//             techStack: [String],
//             duration: String,
//         },
//     ],

//     skills: {
//         languages:    [String],   // Java, Python, C++
//         backend:      [String],   // Node.js, Express, REST APIs
//         databases:    [String],   // MongoDB, PostgreSQL, MySQL
//         tools:        [String],   // Git, Docker, AWS
//         devops:       [String],   // CI/CD, Jenkins, GitHub Actions
//         coreConceptes: [String],  // DSA, OOP, Microservices, System Design
//     },
// },
// {
//     timestamps: true,
// }
// );

// export default mongoose.model('ResumeProfile', resumeProfileSchema);










