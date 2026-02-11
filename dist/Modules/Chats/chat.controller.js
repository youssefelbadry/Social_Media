"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_service_1 = __importDefault(require("./chat.service"));
const validation_middlware_1 = require("../../Middlewares/validation.middlware");
const authentication_middelware_1 = require("../../Middlewares/authentication.middelware");
const token_1 = require("../../Utils/Security/token");
const user_model_1 = require("../../DB/Models/user.model");
const chat_validation_1 = require("./chat.validation");
const authentication = new authentication_middelware_1.AuthenticationMiddleware();
const router = (0, express_1.Router)({
    mergeParams: true,
});
router.get("/", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER, user_model_1.Role.ADMIN]), (0, validation_middlware_1.validation)(chat_validation_1.getChatSchema), chat_service_1.default.getChat);
router.post("/createGroup", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER, user_model_1.Role.ADMIN]), (0, validation_middlware_1.validation)(chat_validation_1.createGroubSchema), chat_service_1.default.createGroup);
router.get("/:groupId/getGroup", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER, user_model_1.Role.ADMIN]), (0, validation_middlware_1.validation)(chat_validation_1.getGroupSchema), chat_service_1.default.getGroup);
exports.default = router;
