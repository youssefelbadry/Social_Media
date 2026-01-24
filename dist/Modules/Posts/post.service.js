"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = require("../../DB/Repository/user.repository");
const user_model_1 = require("../../DB/Models/user.model");
const post_model_1 = require("../../DB/Models/post.model");
const post_repository_1 = require("../../DB/Repository/post.repository");
const error_res_1 = require("../../Utils/Responsive/error.res");
const cloudinary_config_1 = require("../../Utils/Multer/cloudinary.config");
const uuid_1 = require("uuid");
class PostsService {
    _userModel = new user_repository_1.userRepository(user_model_1.userModel);
    _postModel = new post_repository_1.postRepository(post_model_1.postModel);
    constructor() { }
    createPost = async (req, res) => {
        if (req.body.tags?.length &&
            !(await this._userModel.findById({ id: req.body.tags }))) {
            throw new error_res_1.BadRequestException("Some mentions is not exsists");
        }
        let attachments = [];
        let assitId = undefined;
        if (req.files && Array.isArray(req.files) && req.files.length) {
            let assisFiolderId = (0, uuid_1.v4)();
            const cloudinary = await (0, cloudinary_config_1.cloudinaryConfig)();
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: `Social-Media/Users/${req.user?._id}/Posts/${assisFiolderId}`,
                });
                attachments.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
            assitId = assisFiolderId;
        }
        const create = (await this._postModel.createPost({
            data: [
                {
                    ...req.body,
                    createdBy: req.decoded?.id,
                    attachments: attachments,
                    assitFolderId: assitId,
                },
            ],
        })) || null;
        if (!create)
            throw new error_res_1.BadRequestException("Fail to create post");
        res.status(200).json({ message: "Post created successfuly" });
    };
    likePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postModel.findById({
            id: { _id: postId },
        });
        if (!post)
            throw new error_res_1.NotFoundException("Not founded post");
        const alreadyLiked = post.likes?.some((id) => id.toString() === req.user?._id.toString());
        const update = alreadyLiked
            ? { $pull: { likes: req.user?._id } }
            : { $addToSet: { likes: req.user?._id } };
        const updated = await this._postModel.findOneAndUpdate({
            filter: { _id: postId },
            update,
            options: { new: true },
        });
        if (!updated)
            throw new error_res_1.BadRequestException("Error to action to the post");
        return res.status(200).json({
            message: alreadyLiked ? "Unliked" : "Liked",
            likes: updated.likes,
            numLikes: updated.likes?.length,
        });
    };
}
exports.default = new PostsService();
