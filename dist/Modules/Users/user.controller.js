"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const authentication_middelware_1 = require("../../Middlewares/authentication.middelware");
const token_1 = require("../../Utils/Security/token");
const user_model_1 = require("../../DB/Models/user.model");
const authentication = new authentication_middelware_1.AuthenticationMiddleware();
const router = (0, express_1.Router)();
router.get("/getProfile", authentication.authenticate(token_1.TokenTypeEnum.ACCESS, [user_model_1.Role.USER]), user_service_1.default.getProfile);
exports.default = router;
