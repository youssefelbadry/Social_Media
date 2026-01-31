"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_service_1 = __importDefault(require("./comment.service"));
const authentication_middelware_1 = require("../../Middlewares/authentication.middelware");
const token_1 = require("../../Utils/Security/token");
const user_model_1 = require("../../DB/Models/user.model");
const cloud_multer_1 = require("../../Utils/Multer/cloud.multer");
const comment_validation_1 = require("./comment.validation");
const validation_middlware_1 = require("../../Middlewares/validation.middlware");
const authentication = new authentication_middelware_1.AuthenticationMiddleware();
const router = (0, express_1.Router)({
    mergeParams: true,
});
router.post("/", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER]), (0, validation_middlware_1.validation)(comment_validation_1.createCommentSchema), (0, cloud_multer_1.cloufFileUploud)({
    validation: [...cloud_multer_1.filterFile.image],
}).single("attachment"), comment_service_1.default.createComment);
router.patch("/:commentId/likeComment", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER]), (0, validation_middlware_1.validation)(comment_validation_1.likeCommentSchema), (0, cloud_multer_1.cloufFileUploud)({
    validation: [...cloud_multer_1.filterFile.image],
}).single("attachment"), comment_service_1.default.likeComment);
router.delete("/:commentId/softDeletecomment", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER, user_model_1.Role.ADMIN]), comment_service_1.default.softDeletecomment);
exports.default = router;
