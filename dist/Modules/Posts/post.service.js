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
                    createdBy: req.user?._id,
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
    getAllPosts = async (req, res) => {
        const { page, size } = req.query;
        const getAll = await this._postModel.pagination({
            filter: { availability: post_model_1.Avaibility.PUBLIC },
            page,
            size,
        });
        return res
            .status(200)
            .json({ message: "Posts get all successfuly", getAll });
    };
    freezePost = async (req, res) => {
        const { postId } = req.params;
        const { reason } = req.body;
        const post = await this._postModel.findById({ id: postId });
        if (!post)
            throw new error_res_1.NotFoundException("Post not found");
        const isOwner = post.createdBy === req.decoded?.id;
        const isAdmin = req.user?.role === user_model_1.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new error_res_1.ForbiddenException("You are not allowed to freeze this post");
        }
        if (post.freezeAt) {
            throw new error_res_1.BadRequestException("Post already freezed");
        }
        if (isAdmin && !reason) {
            throw new error_res_1.BadRequestException("Reason is required for admin actions");
        }
        const freeze = await this._postModel.findOneAndUpdate({
            filter: { _id: postId },
            update: {
                freezeBy: req.user?._id,
                freezeAt: new Date(),
                freezeReason: isAdmin ? reason : user_model_1.ReasonEnum.USER_REQUEST,
            },
            options: { new: true },
        });
        if (!freeze)
            throw new error_res_1.BadRequestException("Error freezing post");
        return res.status(200).json({
            message: isOwner ? "You freezed your post" : "Admin freezed the post",
            post: freeze,
        });
    };
    restorePost = async (req, res) => {
        const { postId } = req.params;
        const userFreezes = [user_model_1.ReasonEnum.USER_REQUEST];
        const adminFreezes = [
            user_model_1.ReasonEnum.ADMIN_ACTION,
            user_model_1.ReasonEnum.SPAM,
            user_model_1.ReasonEnum.SCAM,
            user_model_1.ReasonEnum.NUDITY,
            user_model_1.ReasonEnum.HATE_SPEECH,
            user_model_1.ReasonEnum.HARASSMENT,
        ];
        const post = await this._postModel.findById({ id: postId });
        if (!post)
            throw new error_res_1.NotFoundException("Post not found");
        const freezedBy = post.freezeBy?.toString();
        const currentUser = req.user?._id.toString();
        const currentRole = req.user?.role;
        const freezeReason = post.freezeReason;
        if (!post.freezeAt || !freezeReason) {
            throw new error_res_1.BadRequestException("Post is not freezed");
        }
        if (post.restoreAt) {
            throw new error_res_1.BadRequestException("Post already restored");
        }
        if (userFreezes.includes(freezeReason)) {
            if (currentUser !== freezedBy) {
                throw new error_res_1.ForbiddenException("Only the user can restore this freeze");
            }
        }
        if (adminFreezes.includes(freezeReason)) {
            if (currentRole !== user_model_1.Role.ADMIN) {
                throw new error_res_1.ForbiddenException("Only admin can restore moderation freeze");
            }
        }
        const restore = await this._postModel.findOneAndUpdate({
            filter: { _id: postId },
            update: {
                restoreBy: req.user?._id,
                restoreAt: new Date(),
                freezeBy: undefined,
                freezeAt: undefined,
                freezeReason: undefined,
            },
            options: { new: true },
        });
        if (!restore)
            throw new error_res_1.BadRequestException("Error restoring post");
        return res.status(200).json({
            message: adminFreezes.includes(freezeReason)
                ? "Admin restored the post"
                : "You restored your post",
            post: restore,
        });
    };
    softDeletePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postModel.findById({ id: postId });
        if (!post)
            throw new error_res_1.NotFoundException("Post not found");
        const isOwner = post.createdBy.toString() === req.user?._id.toString();
        const isAdmin = req.user?.role === user_model_1.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new error_res_1.ForbiddenException("You are not allowed to delete this post");
        }
        if (post.deletedAt) {
            throw new error_res_1.BadRequestException("Post already deleted");
        }
        const deleted = await this._postModel.findOneAndUpdate({
            filter: { _id: postId },
            update: {
                deletedBy: req.user?._id,
                deletedAt: new Date(),
            },
            options: { new: true },
        });
        return res.status(200).json({
            message: isOwner ? "You deleted your post" : "Admin deleted the post",
            post: deleted,
        });
    };
    harftDeletePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postModel.findOne({
            filter: {
                _id: postId,
                deletedAt: { $exists: true },
            },
        });
        if (!post)
            throw new error_res_1.NotFoundException("Post not found or not deleted");
        const isAdmin = req.user?.role === user_model_1.Role.ADMIN;
        if (!isAdmin)
            throw new error_res_1.ForbiddenException("Only admin can permanently delete posts");
        const days30 = 30 * 24 * 60 * 60 * 1000;
        const diff = Date.now() - post.deletedAt.getTime();
        if (diff < days30) {
            throw new error_res_1.BadRequestException("Post cannot be permanently deleted yet");
        }
        const hardDeletePost = await this._postModel.hardDelete({
            id: postId,
        });
        return res.status(200).json({
            message: "Post permanently deleted",
            post: hardDeletePost,
        });
    };
}
exports.default = new PostsService();
