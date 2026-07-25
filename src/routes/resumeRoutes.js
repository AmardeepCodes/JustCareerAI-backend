import express from "express";
import multer from "multer";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getProfile,
  uploadAndSaveProfile,
  generateATSResume,
} from "../controllers/resumeController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/profile",   verifyToken, getProfile);
router.post("/upload",   verifyToken, upload.single("resume"), uploadAndSaveProfile);
router.post("/generate", verifyToken, generateATSResume);

export default router;




// import express from "express";
// import { verifyToken } from "../middlewares/verifyToken.js";
// import {
//   getProfile,
//   updateBasicInfo,
//   generateATSResume,
// } from "../controllers/resumeController.js";
 
// const router = express.Router();
 
// router.get("/profile",      verifyToken, getProfile);
// router.put("/update-info",  verifyToken, updateBasicInfo);
// router.post("/generate",    verifyToken, generateATSResume);
 
// export default router;
 




// import express from "express";
// import { verifyToken } from "../middlewares/verifyToken.js";
// import { saveBasicInfo, generateATSResume } from "../controllers/resumeController.js";

// const router = express.Router();

// // Step 1: Basic info save karo
// router.post("/profile", verifyToken, saveBasicInfo);

// // Step 2: ATS resume generate karo
// router.post("/generate", verifyToken, generateATSResume);

// export default router;












// import express from "express";
// // import { createResume } from "../controllers/resumeController.js";
// import { verifyToken } from "../middlewares/verifyToken.js";
// import { generateATSResume } from "../controllers/resumeController.js";


// const router = express.Router();

// router.get("/generate", generateATSResume);
// router.post("/generate", generateATSResume);
// router.post("/generate-ats", verifyToken, generateATSResume);

// export default router;
