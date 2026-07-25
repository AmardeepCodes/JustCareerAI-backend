import { Router } from "express";
// import { registerHandler, loginHandler,verifyEmailHandler, refreshHandler, logoutHandler} from "../controllers/auth/auth.controller.js";
import { registerHandler, loginHandler, getCurrentUserHandler} from "../controllers/auth/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = Router();



router.post('/signup', registerHandler);
router.post('/login', loginHandler);
router.get('/me', verifyToken, getCurrentUserHandler);
// router.get('/verify-email', verifyEmailHandler);
// router.post('/refresh', refreshHandler);
// router.post('/logout', logoutHandler);

export default router;