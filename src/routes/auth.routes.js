import { Router } from "express";
import { changePassword, forgotPasswordRequest, getCurrentUser, refreshAccessToken, resendEmailVerification, resetForgottenPassword, verifyEmail, registerUser, login, logoutUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userChangeCurrentPasswordValidator, userForgotPasswordValidator, userResetForgottenPasswordValidator, userRegisterValidator, userLoginValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();
//unsecure routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgottenPasswordValidator(), validate, resetForgottenPassword);


//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changePassword);
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification);
export default router;