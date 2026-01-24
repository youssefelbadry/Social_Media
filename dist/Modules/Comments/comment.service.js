"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = require("../../DB/Repository/user.repository");
const user_model_1 = require("../../DB/Models/user.model");
const post_repository_1 = require("../../DB/Repository/post.repository");
const post_model_1 = require("../../DB/Models/post.model");
const error_res_1 = require("../../Utils/Responsive/error.res");
const cloudinary_config_1 = require("../../Utils/Multer/cloudinary.config");
const comment_model_1 = require("../../DB/Models/comment.model");
const comment_repository_1 = require("../../DB/Repository/comment.repository");
class UserService {
    _userModel = new user_repository_1.userRepository(user_model_1.userModel);
    _postModel = new post_repository_1.postRepository(post_model_1.postModel);
    _commenetModel = new comment_repository_1.commentRepository(comment_model_1.commentModel);
    constructor() { }
    createComment = async (req, res) => {
        const { postId } = req.params;
        const checkPost = await this._postModel.findOne({
            filter: {
                _id: postId,
                allowedComment: post_model_1.AllowedComments.ALLOW,
            },
        });
        if (!checkPost)
            throw new error_res_1.NotFoundException("Post not found");
        if (req.body.tags?.length &&
            !(await this._userModel.findById({ id: req.body.tags }))) {
            throw new error_res_1.BadRequestException("Some mentions is not exsists");
        }
        let attachments = [];
        if (req.files && Array.isArray(req.files) && req.files.length) {
            const cloudinary = await (0, cloudinary_config_1.cloudinaryConfig)();
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: `Social-Media/Users/${checkPost.createdBy}/Posts/${postId}/Comments/${checkPost.assitFolderId}`,
                });
                attachments.push(result.secure_url);
            }
        }
        const createComment = await this._commenetModel.createComment({
            data: [
                {
                    ...req.body,
                    postId,
                    createdBy: req.user?._id,
                    attachments,
                },
            ],
        });
        if (!createComment)
            throw new error_res_1.BadRequestException("Fail to create comment");
        return res.status(201).json({
            message: "Comment created successfully",
            comment: createComment,
        });
    };
    likeComment = async (req, res) => {
        const { commentId } = req.params;
        const comment = await this._commenetModel.findById({ id: commentId });
        if (!comment)
            throw new error_res_1.NotFoundException("Comment not found");
        const alreadyLiked = comment.likes?.some((id) => id.toString() === req.user?._id.toString());
        const update = alreadyLiked
            ? { $pull: { likes: req.user?._id } }
            : { $addToSet: { likes: req.user?._id } };
        const updated = await this._commenetModel.findOneAndUpdate({
            filter: { _id: commentId },
            update,
            options: { new: true },
        });
        if (!updated)
            throw new error_res_1.BadRequestException("Error toggling like for this comment");
        return res.status(200).json({
            message: alreadyLiked ? "Unliked" : "Liked",
            likes: updated.likes,
            numLikes: updated.likes?.length,
        });
    };
}
exports.default = new UserService();
