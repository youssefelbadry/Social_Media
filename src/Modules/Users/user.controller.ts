import { Router } from "express";
import userService from "./user.service";
import { AuthenticationMiddleware } from "../../Middlewares/authentication.middelware";
import { TokenTypeEnum } from "../../Utils/Security/token";
import { Role } from "../../DB/Models/user.model";
const authentication = new AuthenticationMiddleware();
const router: Router = Router();

router.get(
  "/getProfile",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  userService.getProfile
);

export default router;
