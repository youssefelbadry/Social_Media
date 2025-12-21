import { Router } from "express";
import authService from "./auth.service";
import { validation } from "../../Middlewares/validation.middlware";
import {
  confirmEmailSchema,
  loginSchema,
  requestOtpSchema,
  signUpSchema,
} from "./auth.validation";
import { AuthenticationMiddleware } from "../../Middlewares/authentication.middelware";
import { TokenTypeEnum } from "../../Utils/Security/token";
const authentication = new AuthenticationMiddleware();

const router: Router = Router();

router.post("/signup", validation(signUpSchema), authService.signup);
router.post(
  "/requestOtp",
  validation(requestOtpSchema),
  authService.requestConfirmEmail
);
router.post(
  "/confirmEmail",
  validation(confirmEmailSchema),
  authService.confirmEmail
);
router.post("/login", validation(loginSchema), authService.login);
router.post(
  "/logout",
  authentication.authenticate(TokenTypeEnum.ACCESS),
  authService.logout
);
router.post(
  "/refreshToken",
  authentication.authenticate(TokenTypeEnum.REFRESH),
  authService.refreshToken
);

export default router;
