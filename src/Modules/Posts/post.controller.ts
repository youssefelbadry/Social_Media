import { Router } from "express";
import { validation } from "../../Middlewares/validation.middlware";
import { AuthenticationMiddleware } from "../../Middlewares/authentication.middelware";
import { TokenTypeEnum } from "../../Utils/Security/token";
import postService from "./post.service";
import commentRouter from "../Comments/comment.controller";
import { createPostSchema, likePostSchema } from "./post.validation";
import { Role } from "../../DB/Models/user.model";
import { cloufFileUploud, filterFile } from "../../Utils/Multer/cloud.multer";
const authentication = new AuthenticationMiddleware();

const router: Router = Router();
router.use("/:postId/comment", commentRouter);

router.post(
  "/createPost",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  validation(createPostSchema),
  cloufFileUploud({
    validation: [...filterFile.image],
  }).single("attachment"),
  postService.createPost,
);
router.patch(
  "/:postId/like",
  authentication.authenticate(TokenTypeEnum.ACCESS, [Role.USER]),
  validation(likePostSchema),
  postService.likePost,
);
export default router;
