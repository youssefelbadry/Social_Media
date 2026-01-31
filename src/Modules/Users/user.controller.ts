import { Router } from "express";
import userService from "./user.service";
import chatRouter from "../Chats/chat.controller";

import { AuthenticationMiddleware } from "../../Middlewares/authentication.middelware";
import { TokenTypeEnum } from "../../Utils/Security/token";
import { Role } from "../../DB/Models/user.model";
import {
  cloufFileUploud,
  filterFile,
  storgeFilter,
} from "../../Utils/Multer/cloud.multer";
import s3CinfigService from "../../Utils/Multer/s3.config.service";
import { validation } from "../../Middlewares/validation.middlware";
import {
  acceptfriendSchema,
  followSchema,
  friendSchema,
} from "./user.validation";

const authentication = new AuthenticationMiddleware();
const router: Router = Router();
router.use("/:userId/chat", chatRouter);

router.get(
  "/getProfile",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  userService.getProfile,
);
router.patch(
  "/profileImage",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  cloufFileUploud({
    validation: [...filterFile.image],
    storgeApproch: storgeFilter.MEMORY,
    maxSizeMB: 2,
  }).single("attachment"),
  userService.profileImage,
);
router.patch(
  "/coverImage",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  cloufFileUploud({
    validation: [...filterFile.image],
    storgeApproch: storgeFilter.MEMORY,
    maxSizeMB: 2,
  }).single("attachment"),
  userService.coverImage,
);
router.get("uploads/pre-signed/*path", s3CinfigService.getsignedFile);
router.get("uploads/*path", s3CinfigService.getFileConfig);
router.delete("deleteFile", s3CinfigService.deleteFile);
router.delete("deleteFiles", s3CinfigService.deleteFiles);
router.post(
  "/:userId/follow",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER, Role.ADMIN]),
  validation(followSchema),
  userService.actionFollow,
);
router.post(
  "/:userId/freezeAccount",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER, Role.ADMIN]),
  userService.freezeAccount,
);
router.post(
  "/:userId/restoreAccount",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER, Role.ADMIN]),
  userService.restoreAccount,
);

router.post(
  "/:userId/friend-req",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  validation(friendSchema),
  userService.sendRequest,
);

router.post(
  "/:reqId/accept-friend-req",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  validation(acceptfriendSchema),
  userService.acceptSendRequest,
);

export default router;
