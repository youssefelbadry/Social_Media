import { Router } from "express";
import userService from "./user.service";
import { AuthenticationMiddleware } from "../../Middlewares/authentication.middelware";
import { TokenTypeEnum } from "../../Utils/Security/token";
import { Role } from "../../DB/Models/user.model";
import {
  cloufFileUploud,
  filterFile,
  storgeFilter,
} from "../../Utils/Multer/cloud.multer";
const authentication = new AuthenticationMiddleware();
const router: Router = Router();

router.get(
  "/getProfile",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  userService.getProfile
);
router.patch(
  "/profileImage",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  cloufFileUploud({
    validation: [...filterFile.image],
    storgeApproch: storgeFilter.MEMORY,
    maxSizeMB: 2,
  }).single("attachment"),
  userService.profileImage
);
router.patch(
  "/coverImage",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  cloufFileUploud({
    validation: [...filterFile.image],
    storgeApproch: storgeFilter.MEMORY,
    maxSizeMB: 2,
  }).single("attachment"),
  userService.coverImage
);

export default router;
