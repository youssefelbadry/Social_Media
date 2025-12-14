import { Router } from "express";
import authService from "./auth.service";
const router: Router = Router();

router.get("/sign", authService.signup);
router.get("/login", authService.login);

export default router;
