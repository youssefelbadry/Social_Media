"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3_congig_1 = require("../../Utils/Multer/s3.congig");
const user_repository_1 = require("../../DB/Repository/user.repository");
const user_model_1 = require("../../DB/Models/user.model");
const error_res_1 = require("../../Utils/Responsive/error.res");
const mongoose_1 = require("mongoose");
const friends_repository_1 = require("../../DB/Repository/friends.repository");
const friendReq_model_1 = require("../../DB/Models/friendReq.model");
class UserService {
    _userModel = new user_repository_1.userRepository(user_model_1.userModel);
    _friendsModel = new friends_repository_1.FriendsRepository(friendReq_model_1.friendsModel);
    constructor() { }
    getProfile = async (req, res) => {
        await req.user?.populate("friends");
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
    actionFollow = async (req, res) => {
        const { userId } = req.params;
        const currentUserId = req.user?._id.toString();
        if (!currentUserId)
            throw new error_res_1.BadRequestException("User not authenticated");
        if (userId === currentUserId)
            throw new error_res_1.BadRequestException("You cannot follow yourself");
        const targetuser = await this._userModel.findById({
            id: userId,
        });
        if (!targetuser)
            throw new error_res_1.NotFoundException("User not found");
        const alreadyFollowing = targetuser.followers?.some((id) => id.toString() === currentUserId);
        const targetUpdate = alreadyFollowing
            ? { $pull: { followers: currentUserId } }
            : { $addToSet: { followers: currentUserId } };
        const currentUpdate = alreadyFollowing
            ? { $pull: { following: userId } }
            : { $addToSet: { following: userId } };
        const [target, current] = await Promise.all([
            this._userModel.findOneAndUpdate({
                filter: { _id: userId },
                update: targetUpdate,
                options: { new: true },
            }),
            this._userModel.findOneAndUpdate({
                filter: { _id: currentUserId },
                update: currentUpdate,
                options: { new: true },
            }),
        ]);
        if (!target || !current)
            throw new error_res_1.BadRequestException("Error toggling follow for this user");
        return res.status(200).json({
            message: alreadyFollowing ? "Unfollowed" : "Followed",
            followers: target.followers,
            numFollowers: target?.followers?.length,
            numFollowing: current?.following,
            following: current?.following?.length,
        });
    };
    sendRequest = async (req, res) => {
        const { userId } = req.params;
        const currentUser = req.user?._id;
        if (userId.toString() === req.user?._id.toString())
            throw new error_res_1.BadRequestException("You cannot add yourself");
        const checkUser = await this._userModel.findById({ id: userId });
        if (!checkUser)
            throw new error_res_1.NotFoundException("User not founded");
        const existing = await this._friendsModel.findOne({
            filter: {
                $or: [
                    {
                        sender: currentUser,
                        receiver: userId,
                    },
                    { sender: userId, receiver: currentUser },
                ],
            },
        });
        if (existing) {
            if (existing.status === friendReq_model_1.FriendStatus.ACCEPTED)
                throw new error_res_1.BadRequestException("Already friends");
            if (existing.status === friendReq_model_1.FriendStatus.PENDING)
                throw new error_res_1.BadRequestException("Request already sent");
            if (existing.status === friendReq_model_1.FriendStatus.BLOCKED)
                throw new error_res_1.ForbiddenException("You cannot send request");
        }
        const send = await this._friendsModel.createFriends({
            data: [
                {
                    sender: new mongoose_1.Types.ObjectId(req.user?._id),
                    receiver: new mongoose_1.Types.ObjectId(userId),
                    status: friendReq_model_1.FriendStatus.PENDING,
                },
            ],
        });
        if (!send)
            throw new error_res_1.BadRequestException("Error to send add friend");
        return res.status(200).json({
            message: "Friend request sent",
            friends: send,
        });
    };
    acceptSendRequest = async (req, res) => {
        const { reqId } = req.params;
        const currentUser = req.user?._id.toString();
        const request = await this._friendsModel.findById({ id: reqId });
        if (!request)
            throw new error_res_1.NotFoundException("Request not found");
        if (request.receiver.toString() !== currentUser)
            throw new error_res_1.ForbiddenException("Not your request");
        if (request.status !== friendReq_model_1.FriendStatus.PENDING)
            throw new error_res_1.BadRequestException("Request already handled");
        const accepted = await this._friendsModel.findOneAndUpdate({
            filter: { _id: reqId },
            update: {
                status: friendReq_model_1.FriendStatus.ACCEPTED,
                actionBy: currentUser,
                acceptedAt: new Date(),
            },
            options: { new: true },
        });
        if (!accepted)
            throw new error_res_1.BadRequestException("Error to accept friend");
        await Promise.all([
            this._userModel.findOneAndUpdate({
                filter: { _id: accepted.receiver.toString() },
                update: { $addToSet: { friends: accepted.sender } },
            }),
            this._userModel.findOneAndUpdate({
                filter: { _id: accepted.sender.toString() },
                update: { $addToSet: { friends: accepted.receiver } },
            }),
        ]);
        return res.status(200).json({
            message: "Friend request accepted",
            request: accepted,
        });
    };
    freezeAccount = async (req, res) => {
        const { userId } = req.params;
        const { reason } = req.body;
        const account = await this._userModel.findById({ id: userId });
        if (!account)
            throw new error_res_1.NotFoundException("account not found");
        const isOwner = account._id.toString() === req.user?._id.toString();
        const isAdmin = req.user?.role === user_model_1.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new error_res_1.ForbiddenException("You are not allowed to freeze this account");
        }
        if (account.freezeAt) {
            throw new error_res_1.BadRequestException("account already freezed");
        }
        if (isAdmin && !reason) {
            throw new error_res_1.BadRequestException("Reason is required for admin actions");
        }
        const freeze = await this._userModel.findOneAndUpdate({
            filter: { _id: userId },
            update: {
                freezeBy: req.user?._id,
                freezeAt: new Date(),
                freezeReason: isAdmin ? reason : user_model_1.ReasonEnum.USER_REQUEST,
            },
            options: { new: true },
        });
        if (!freeze)
            throw new error_res_1.BadRequestException("Error freezing account");
        return res.status(200).json({
            message: isOwner
                ? "You freezed your account"
                : "Admin freezed the account",
            post: freeze,
        });
    };
    restoreAccount = async (req, res) => {
        const { userId } = req.params;
        const userFreezes = [user_model_1.ReasonEnum.USER_REQUEST];
        const adminFreezes = [
            user_model_1.ReasonEnumAdmin,
            user_model_1.ReasonEnum.SPAM,
            user_model_1.ReasonEnum.SCAM,
            user_model_1.ReasonEnum.NUDITY,
            user_model_1.ReasonEnum.HATE_SPEECH,
            user_model_1.ReasonEnum.HARASSMENT,
        ];
        const account = await this._userModel.findById({ id: userId });
        if (!account)
            throw new error_res_1.NotFoundException("account not found");
        const freezedBy = account.freezeBy?.toString();
        const currentUser = req.user?._id.toString();
        const currentRole = req.user?.role;
        const freezeReason = account.freezeReason;
        if (!account.freezeAt || !freezeReason) {
            throw new error_res_1.BadRequestException("account is not freezed");
        }
        if (account.restoredAt) {
            throw new error_res_1.BadRequestException("account already restored");
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
        const restore = await this._userModel.findOneAndUpdate({
            filter: { _id: userId },
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
            throw new error_res_1.BadRequestException("Error restoring account");
        return res.status(200).json({
            message: adminFreezes.includes(freezeReason)
                ? "Admin restored the account"
                : "You restored your account",
            account: restore,
        });
    };
}
exports.default = new UserService();
