import { Router } from "express";
import chatService from "./chat.service";
import { validation } from "../../Middlewares/validation.middlware";
import { AuthenticationMiddleware } from "../../Middlewares/authentication.middelware";
import { TokenTypeEnum } from "../../Utils/Security/token";
import { Role } from "../../DB/Models/user.model";
import {
  getGroupSchema,
  getChatSchema,
  createGroubSchema,
} from "./chat.validation";
const authentication = new AuthenticationMiddleware();

const router: Router = Router({
  mergeParams: true,
});

router.get(
  "/",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER, Role.ADMIN]),
  validation(getChatSchema),
  chatService.getChat,
);

router.post(
  "/createGroup",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER, Role.ADMIN]),
  validation(createGroubSchema),
  chatService.createGroup,
);
router.get(
  "/:groupId/getGroup",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER, Role.ADMIN]),
  validation(getGroupSchema),
  chatService.getGroup,
);
export default router;
