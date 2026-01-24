"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3_congig_1 = require("../../Utils/Multer/s3.congig");
const user_repository_1 = require("../../DB/Repository/user.repository");
const user_model_1 = require("../../DB/Models/user.model");
class UserService {
    _userModel = new user_repository_1.userRepository(user_model_1.userModel);
    constructor() { }
    getProfile = async (req, res) => {
        return res.status(200).json({
            message: "Done",
            data: { user: req.user, decoded: req.decoded },
        });
    };
    profileImage = async (req, res) => {
        const { ContentType, originalName, } = req.body;
        const { url, key } = await (0, s3_congig_1.createPresignedUrl)({
            ContentType,
            originalName,
            path: `users/${req.decoded?._id}`,
        });
        await this._userModel.updateOne({
            filter: req.decoded?._id,
            update: { prifileImage: key },
        });
        return res.status(200).json({
            message: "Done",
            key,
        });
    };
    coverImage = async (req, res) => {
        const urls = await (0, s3_congig_1.uploadFiles)({
            files: req.files,
            path: `users/${req.decoded?._id}/cover`,
        });
        return res.status(200).json({
            message: "Done",
            urls,
        });
    };
}
exports.default = new UserService();
