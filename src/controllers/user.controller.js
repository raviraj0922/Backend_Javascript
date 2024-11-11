import { Router } from 'express'; // Add this import
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js"; // Corrected function name
import {upload} from "../middlware/multer.middleware.js"
import { verifyJWT } from '../middlware/auth.middleware.js';

const router = Router();

// POST route for user registration
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser)

// secure routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;
