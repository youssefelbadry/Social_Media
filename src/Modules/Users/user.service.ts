import { Request, Response } from "express";
import {
  createPresignedUrl,
  uploadFile,
  uploadFiles,
} from "../../Utils/Multer/s3.congig";
import { userRepository } from "../../DB/Repository/user.repository";
import {
  HUserDoc,
  ReasonEnum,
  ReasonEnumAdmin,
  Role,
  userModel,
} from "../../DB/Models/user.model";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/Responsive/error.res";
import { Types, UpdateQuery } from "mongoose";
import { FriendsRepository } from "../../DB/Repository/friends.repository";
import { friendsModel, FriendStatus } from "../../DB/Models/friendReq.model";
import { chatRepository } from "../../DB/Repository/chat.repository";
import { chatModel } from "../../DB/Models/chat.model";

class UserService {
  private _userModel = new userRepository(userModel);
  private _friendsModel = new FriendsRepository(friendsModel);
  private _chatModel = new chatRepository(chatModel);
  constructor() {}

  //getProfile=========================================================
  getProfile = async (req: Request, res: Response) => {
    await req.user?.populate("friends");

    const groups = await this._chatModel.find({
      filter: {
        participants: { $in: [req.user?._id as Types.ObjectId] },
        group_name: { $exists: true },
      },
    });
    return res.status(200).json({
      message: "Done",
      data: { user: req.user, decoded: req.decoded, groups },
    });
  };
  profileImage = async (req: Request, res: Response) => {
    const {
      ContentType,
      originalName,
    }: { ContentType: string; originalName: string } = req.body;

    const { url, key } = await createPresignedUrl({
      ContentType,
      originalName,
      path: `users/${req.decoded?._id}`,
    });
    // const key = await uploadFile({
    //   path: `users/${req.decoded?._id}`,
    //   file: req.file as Express.Multer.File,
    // });

    await this._userModel.updateOne({
      filter: req.decoded?._id,
      update: { prifileImage: key },
    });

    return res.status(200).json({
      message: "Done",
      key,
    });
  };
  coverImage = async (req: Request, res: Response) => {
    const urls = await uploadFiles({
      files: req.files as Express.Multer.File[],
      path: `users/${req.decoded?._id}/cover`,
    });
    return res.status(200).json({
      message: "Done",
      urls,
    });
  };
  actionFollow = async (req: Request, res: Response) => {
    const { userId } = req.params as unknown as { userId: string };
    const currentUserId = req.user?._id.toString();

    if (!currentUserId) throw new BadRequestException("User not authenticated");
    if (userId === currentUserId)
      throw new BadRequestException("You cannot follow yourself");

    const targetuser = await this._userModel.findById({
      id: userId,
    });
    if (!targetuser) throw new NotFoundException("User not found");

    const alreadyFollowing = targetuser.followers?.some(
      (id) => id.toString() === currentUserId,
    );

    const targetUpdate: UpdateQuery<HUserDoc> = alreadyFollowing
      ? { $pull: { followers: currentUserId } }
      : { $addToSet: { followers: currentUserId } };
    const currentUpdate: UpdateQuery<HUserDoc> = alreadyFollowing
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
      throw new BadRequestException("Error toggling follow for this user");

    return res.status(200).json({
      message: alreadyFollowing ? "Unfollowed" : "Followed",
      followers: target.followers,
      numFollowers: target?.followers?.length,
      numFollowing: current?.following,
      following: current?.following?.length,
    });
  };

  sendRequest = async (req: Request, res: Response) => {
    const { userId } = req.params as unknown as { userId: string };
    const currentUser = req.user?._id as unknown as Types.ObjectId;

    if (userId.toString() === req.user?._id.toString())
      throw new BadRequestException("You cannot add yourself");
    const checkUser = await this._userModel.findById({ id: userId });
    if (!checkUser) throw new NotFoundException("User not founded");

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
      if (existing.status === FriendStatus.ACCEPTED)
        throw new BadRequestException("Already friends");

      if (existing.status === FriendStatus.PENDING)
        throw new BadRequestException("Request already sent");

      if (existing.status === FriendStatus.BLOCKED)
        throw new ForbiddenException("You cannot send request");
    }

    const send = await this._friendsModel.createFriends({
      data: [
        {
          sender: new Types.ObjectId(req.user?._id),
          receiver: new Types.ObjectId(userId),
          status: FriendStatus.PENDING,
        },
      ],
    });

    if (!send) throw new BadRequestException("Error to send add friend");
    return res.status(200).json({
      message: "Friend request sent",
      friends: send,
    });
  };

  acceptSendRequest = async (req: Request, res: Response) => {
    const { reqId } = req.params as { reqId: string };
    const currentUser = req.user?._id.toString();

    const request = await this._friendsModel.findById({ id: reqId });

    if (!request) throw new NotFoundException("Request not found");

    if (request.receiver.toString() !== currentUser)
      throw new ForbiddenException("Not your request");

    if (request.status !== FriendStatus.PENDING)
      throw new BadRequestException("Request already handled");

    const accepted = await this._friendsModel.findOneAndUpdate({
      filter: { _id: reqId },
      update: {
        status: FriendStatus.ACCEPTED,
        actionBy: currentUser,
        acceptedAt: new Date(),
      },
      options: { new: true },
    });
    if (!accepted) throw new BadRequestException("Error to accept friend");

    // add friends both sides
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

  freezeAccount = async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const { reason } = req.body as { reason?: ReasonEnum };

    const account = await this._userModel.findById({ id: userId });
    if (!account) throw new NotFoundException("account not found");

    const isOwner = account._id.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        "You are not allowed to freeze this account",
      );
    }

    if (account.freezeAt) {
      throw new BadRequestException("account already freezed");
    }

    if (isAdmin && !reason) {
      throw new BadRequestException("Reason is required for admin actions");
    }

    const freeze = await this._userModel.findOneAndUpdate({
      filter: { _id: userId },
      update: {
        freezeBy: req.user?._id,
        freezeAt: new Date(),
        freezeReason: isAdmin ? reason : ReasonEnum.USER_REQUEST,
      },
      options: { new: true },
    });

    if (!freeze) throw new BadRequestException("Error freezing account");

    return res.status(200).json({
      message: isOwner
        ? "You freezed your account"
        : "Admin freezed the account",
      post: freeze,
    });
  };

  restoreAccount = async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const userFreezes = [ReasonEnum.USER_REQUEST];
    const adminFreezes = [
      ReasonEnumAdmin,
      ReasonEnum.SPAM,
      ReasonEnum.SCAM,
      ReasonEnum.NUDITY,
      ReasonEnum.HATE_SPEECH,
      ReasonEnum.HARASSMENT,
    ];

    const account = await this._userModel.findById({ id: userId });
    if (!account) throw new NotFoundException("account not found");

    const freezedBy = account.freezeBy?.toString();
    const currentUser = req.user?._id.toString();
    const currentRole = req.user?.role;
    const freezeReason = account.freezeReason;

    if (!account.freezeAt || !freezeReason) {
      throw new BadRequestException("account is not freezed");
    }

    if (account.restoredAt) {
      throw new BadRequestException("account already restored");
    }

    if (userFreezes.includes(freezeReason)) {
      if (currentUser !== freezedBy) {
        throw new ForbiddenException("Only the user can restore this freeze");
      }
    }

    if (adminFreezes.includes(freezeReason)) {
      if (currentRole !== Role.ADMIN) {
        throw new ForbiddenException(
          "Only admin can restore moderation freeze",
        );
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

    if (!restore) throw new BadRequestException("Error restoring account");

    return res.status(200).json({
      message: adminFreezes.includes(freezeReason)
        ? "Admin restored the account"
        : "You restored your account",
      account: restore,
    });
  };
}

export default new UserService();
