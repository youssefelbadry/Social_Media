"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationMiddleware = void 0;
const user_model_1 = require("../DB/Models/user.model");
const token_1 = require("../Utils/Security/token");
const error_res_1 = require("../Utils/Responsive/error.res");
const token_model_1 = require("../DB/Models/token.model");
const token_repository_1 = require("../DB/Repository/token.repository");
class AuthenticationMiddleware {
    _tokenRepo = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    constructor() { }
    authenticate(tokenType = token_1.TokenTypeEnum.ACCESS, accessRole = []) {
        return async (req, res, next) => {
            if (!req.headers.authorization) {
                throw new error_res_1.BadRequestException("Missing authorization header");
            }
            const { user, decoded } = await (0, token_1.decodedToken)(req.headers.authorization, tokenType);
            if (!decoded.jti) {
                throw new error_res_1.BadRequestException("Invalid token: missing jti claim");
            }
            const isRevoked = await this._tokenRepo.findOne({
                filter: { jti: decoded.jti },
            });
            if (isRevoked) {
                throw new error_res_1.ForbiddenException("Token revoked");
            }
            if (accessRole.length && !accessRole.includes(user.role)) {
                throw new error_res_1.ForbiddenException("You are not authorized to access this resource");
            }
            if (user.freezeAt) {
                if (user.freezeReason !== user_model_1.ReasonEnum.USER_REQUEST &&
                    user.role !== "ADMIN") {
                    throw new error_res_1.ForbiddenException("Account frozen by moderation");
                }
                if (!req.path.includes("/restore")) {
                    throw new error_res_1.ForbiddenException("Account frozen — Restore required");
                }
            }
            req.user = user;
            req.decoded = decoded;
            return next();
        };
    }
}
exports.AuthenticationMiddleware = AuthenticationMiddleware;
exports.default = new AuthenticationMiddleware();
