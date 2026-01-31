import { Router } from "express";
import commentService from "./comment.service";
import { AuthenticationMiddleware } from "../../Middlewares/authentication.middelware";
import { TokenTypeEnum } from "../../Utils/Security/token";
import { Role } from "../../DB/Models/user.model";
import { cloufFileUploud, filterFile } from "../../Utils/Multer/cloud.multer";
import { createCommentSchema, likeCommentSchema } from "./comment.validation";
import { validation } from "../../Middlewares/validation.middlware";

const authentication = new AuthenticationMiddleware();
const router: Router = Router({
  mergeParams: true,
});
router.post(
  "/",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  validation(createCommentSchema),
  cloufFileUploud({
    validation: [...filterFile.image],
  }).single("attachment"),
  commentService.createComment,
);
router.patch(
  "/:commentId/likeComment",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  validation(likeCommentSchema),
  cloufFileUploud({
    validation: [...filterFile.image],
  }).single("attachment"),
  commentService.likeComment,
);

router.delete(
  "/:commentId/softDeletecomment",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER, Role.ADMIN]),
  commentService.softDeletecomment,
);

export default router;
