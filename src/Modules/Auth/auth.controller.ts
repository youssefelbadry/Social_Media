import { Router } from "express";
import authService from "./auth.service";
import { validation } from "../../Middlewares/validation.middlware";
import { loginSchema, signUpSchema } from "./auth.validation";
const router: Router = Router();

router.post("/signup", validation(signUpSchema), authService.signup);
router.post("/login", validation(loginSchema), authService.login);

export default router;
