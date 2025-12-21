"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodedToken = exports.createLoginCredentials = exports.getSigneture = exports.getSigentsureLevel = exports.virifyToken = exports.generateToken = exports.TokenTypeEnum = exports.signatureLevel = void 0;
const user_model_1 = require("./../../DB/Models/user.model");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_2 = require("../../DB/Models/user.model");
const uuid_1 = require("uuid");
const error_res_1 = require("../Responsive/error.res");
const user_repository_1 = require("../../DB/Repository/user.repository");
var signatureLevel;
(function (signatureLevel) {
    signatureLevel["USER"] = "USER";
    signatureLevel["ADMIN"] = "ADMIN";
})(signatureLevel || (exports.signatureLevel = signatureLevel = {}));
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum["ACCESS"] = "ACCESS";
    TokenTypeEnum["REFRESH"] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
const generateToken = async ({ payload, secret, options, }) => {
    return await (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const virifyToken = async ({ token, secret, }) => {
    return (await (0, jsonwebtoken_1.verify)(token, secret));
};
exports.virifyToken = virifyToken;
const getSigentsureLevel = async (role = user_model_2.Role.USER) => {
    let signatureLevelEnum = signatureLevel.USER;
    return role === user_model_2.Role.ADMIN
        ? (signatureLevelEnum = signatureLevel.ADMIN)
        : (signatureLevelEnum = signatureLevel.USER);
};
exports.getSigentsureLevel = getSigentsureLevel;
const getSigneture = async (signature = signatureLevel.USER) => {
    let signatures = {
        access_token: "",
        refresh_token: "",
    };
    switch (signature) {
        case signatureLevel.ADMIN:
            signatures.access_token = process.env.ADMIN_ACCESS_TOKEN;
            signatures.refresh_token = process.env.ADMIN_REFRESH_TOKEN;
            break;
        case signatureLevel.USER:
            signatures.access_token = process.env.USER_ACCESS_TOKEN;
            signatures.refresh_token = process.env.USER_REFRESH_TOKEN;
            break;
        default:
            break;
    }
    return signatures;
};
exports.getSigneture = getSigneture;
const createLoginCredentials = async (user) => {
    const signatureLevelC = await (0, exports.getSigentsureLevel)(user.role);
    const signature = await (0, exports.getSigneture)(signatureLevelC);
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id, role: user.role },
        secret: signature.access_token,
        options: {
            expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRED),
            jwtid,
        },
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user._id, role: user.role },
        secret: signature.refresh_token,
        options: {
            expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRED),
            jwtid,
        },
    });
    return { access_token, refresh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async (authorization, tokenType = TokenTypeEnum.ACCESS) => {
    const usermodel = new user_repository_1.userRepository(user_model_1.userModel);
    const [bearer, token] = authorization.split(" ");
    if (!bearer || !token)
        throw new error_res_1.UnauthorizedException("Missing Token parts");
    const signatures = await (0, exports.getSigneture)(bearer);
    const decoded = await (0, exports.virifyToken)({
        token,
        secret: tokenType === TokenTypeEnum.REFRESH
            ? signatures.refresh_token
            : signatures.access_token,
    });
    if (!decoded?._id || !decoded.iat)
        throw new error_res_1.UnauthorizedException("Inavlid payloud token");
    const user = await usermodel.findById({ id: decoded._id });
    if (!user)
        throw new error_res_1.NotFoundException("User not founded");
    return { user, decoded };
};
exports.decodedToken = decodedToken;
