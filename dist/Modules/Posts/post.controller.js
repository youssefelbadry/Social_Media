"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middlware_1 = require("../../Middlewares/validation.middlware");
const authentication_middelware_1 = require("../../Middlewares/authentication.middelware");
const token_1 = require("../../Utils/Security/token");
const post_service_1 = __importDefault(require("./post.service"));
const comment_controller_1 = __importDefault(require("../Comments/comment.controller"));
const post_validation_1 = require("./post.validation");
const user_model_1 = require("../../DB/Models/user.model");
const cloud_multer_1 = require("../../Utils/Multer/cloud.multer");
const authentication = new authentication_middelware_1.AuthenticationMiddleware();
const router = (0, express_1.Router)();
router.use("/:postId/comment", comment_controller_1.default);
router.post("/createPost", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER]), (0, validation_middlware_1.validation)(post_validation_1.createPostSchema), (0, cloud_multer_1.cloufFileUploud)({
    validation: [...cloud_multer_1.filterFile.image],
}).single("attachment"), post_service_1.default.createPost);
router.patch("/:postId/like", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER]), (0, validation_middlware_1.validation)(post_validation_1.likePostSchema), post_service_1.default.likePost);
router.get("/getAllPosts", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER]), post_service_1.default.getAllPosts);
router.post("/:postId/freezePost", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER, user_model_1.Role.ADMIN]), post_service_1.default.freezePost);
router.post("/:postId/restorePost", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER, user_model_1.Role.ADMIN]), post_service_1.default.restorePost);
exports.default = router;
