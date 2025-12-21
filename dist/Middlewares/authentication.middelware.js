"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationMiddleware = void 0;
const token_1 = require("../Utils/Security/token");
const error_res_1 = require("../Utils/Responsive/error.res");
const token_model_1 = require("../DB/Models/token.model");
const db_repository_1 = require("../DB/Repository/db.repository");
class AuthenticationMiddleware {
    _tokenRepo = new db_repository_1.TokenRepository(token_model_1.tokenModel);
    constructor() { }
    authenticate(tokenType = token_1.TokenTypeEnum.ACCESS, accessRole = []) {
        return async (req, res, next) => {
            if (!req.headers.authorization) {
                throw new error_res_1.BadRequestException("Missing authorization header");
            }
            const { user, decoded } = await (0, token_1.decodedToken)(req.headers.authorization, tokenType);
            const isRevoked = await this._tokenRepo.findByJwtId(decoded.jti);
            if (isRevoked) {
                throw new error_res_1.ForbiddenException("Token revoked");
            }
            if (accessRole.length && !accessRole.includes(user.role)) {
                throw new error_res_1.ForbiddenException("You are not authorized to access this resource");
            }
            req.user = user;
            req.decoded = decoded;
            return next();
        };
    }
}
exports.AuthenticationMiddleware = AuthenticationMiddleware;
exports.default = new AuthenticationMiddleware();
