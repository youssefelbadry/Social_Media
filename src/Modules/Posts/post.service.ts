import { Request, Response } from "express";
import { userRepository } from "../../DB/Repository/user.repository";
import { ReasonEnum, Role, userModel } from "../../DB/Models/user.model";
import { Avaibility, HPostDoc, postModel } from "../../DB/Models/post.model";
import { postRepository } from "../../DB/Repository/post.repository";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/Responsive/error.res";
import { cloudinaryConfig } from "../../Utils/Multer/cloudinary.config";
import { v4 as uuid } from "uuid";
import { UpdateQuery } from "mongoose";

class PostsService {
  private _userModel = new userRepository(userModel);
  private _postModel = new postRepository(postModel);
  constructor() {}
  createPost = async (req: Request, res: Response) => {
    if (
      req.body.tags?.length &&
      !(await this._userModel.findById({ id: req.body.tags }))
    ) {
      throw new BadRequestException("Some mentions is not exsists");
    }

    let attachments: { url: string; public_id: string }[] = [];
    let assitId = undefined;
    if (req.files && Array.isArray(req.files) && req.files.length) {
      let assisFiolderId = uuid();
      const cloudinary = await cloudinaryConfig();

      for (const file of req.files as Express.Multer.File[]) {
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
    // console.log(attachments);

    const create =
      (await this._postModel.createPost({
        data: [
          {
            ...req.body,
            createdBy: req.user?._id,
            attachments: attachments,
            assitFolderId: assitId,
          },
        ],
      })) || null;

    if (!create) throw new BadRequestException("Fail to create post");

    res.status(200).json({ message: "Post created successfuly" });
  };
  likePost = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: string };

    const post = await this._postModel.findById({
      id: { _id: postId },
    });
    if (!post) throw new NotFoundException("Not founded post");

    const alreadyLiked = post.likes?.some(
      (id) => id.toString() === req.user?._id.toString(),
    );

    const update: UpdateQuery<HPostDoc> = alreadyLiked
      ? { $pull: { likes: req.user?._id } }
      : { $addToSet: { likes: req.user?._id } };

    const updated = await this._postModel.findOneAndUpdate({
      filter: { _id: postId },
      update,
      options: { new: true },
    });

    if (!updated) throw new BadRequestException("Error to action to the post");

    return res.status(200).json({
      message: alreadyLiked ? "Unliked" : "Liked",
      likes: updated.likes,
      numLikes: updated.likes?.length,
    });
  };

  getAllPosts = async (req: Request, res: Response) => {
    const { page, size } = req.query as unknown as {
      page: number;
      size: number;
    };

    const getAll = await this._postModel.pagination({
      filter: { availability: Avaibility.PUBLIC },
      page,
      size,
    });

    return res
      .status(200)
      .json({ message: "Posts get all successfuly", getAll });
  };

  freezePost = async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };
    const { reason } = req.body as { reason?: ReasonEnum };

    const post = await this._postModel.findById({ id: postId });
    if (!post) throw new NotFoundException("Post not found");

    const isOwner = post.createdBy === req.decoded?.id;
    const isAdmin = req.user?.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException("You are not allowed to freeze this post");
    }

    if (post.freezeAt) {
      throw new BadRequestException("Post already freezed");
    }

    if (isAdmin && !reason) {
      throw new BadRequestException("Reason is required for admin actions");
    }

    const freeze = await this._postModel.findOneAndUpdate({
      filter: { _id: postId },
      update: {
        freezeBy: req.user?._id,
        freezeAt: new Date(),
        freezeReason: isAdmin ? reason : ReasonEnum.USER_REQUEST,
      },
      options: { new: true },
    });

    if (!freeze) throw new BadRequestException("Error freezing post");

    return res.status(200).json({
      message: isOwner ? "You freezed your post" : "Admin freezed the post",
      post: freeze,
    });
  };

  restorePost = async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };
    const userFreezes = [ReasonEnum.USER_REQUEST];
    const adminFreezes = [
      ReasonEnum.ADMIN_ACTION,
      ReasonEnum.SPAM,
      ReasonEnum.SCAM,
      ReasonEnum.NUDITY,
      ReasonEnum.HATE_SPEECH,
      ReasonEnum.HARASSMENT,
    ];

    const post = await this._postModel.findById({ id: postId });
    if (!post) throw new NotFoundException("Post not found");

    const freezedBy = post.freezeBy?.toString();
    const currentUser = req.user?._id.toString();
    const currentRole = req.user?.role;
    const freezeReason = post.freezeReason;

    if (!post.freezeAt || !freezeReason) {
      throw new BadRequestException("Post is not freezed");
    }

    if (post.restoreAt) {
      throw new BadRequestException("Post already restored");
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

    if (!restore) throw new BadRequestException("Error restoring post");

    return res.status(200).json({
      message: adminFreezes.includes(freezeReason)
        ? "Admin restored the post"
        : "You restored your post",
      post: restore,
    });
  };

  softDeletePost = async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };

    const post = await this._postModel.findById({ id: postId });
    if (!post) throw new NotFoundException("Post not found");

    const isOwner = post.createdBy.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException("You are not allowed to delete this post");
    }

    if (post.deletedAt) {
      throw new BadRequestException("Post already deleted");
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

  harftDeletePost = async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };

    const post = await this._postModel.findOne({
      filter: {
        _id: postId,
        deletedAt: { $exists: true },
      },
    });

    if (!post) throw new NotFoundException("Post not found or not deleted");

    const isAdmin = req.user?.role === Role.ADMIN;
    if (!isAdmin)
      throw new ForbiddenException("Only admin can permanently delete posts");

    const days30 = 30 * 24 * 60 * 60 * 1000;
    const diff = Date.now() - post.deletedAt.getTime();

    if (diff < days30) {
      throw new BadRequestException("Post cannot be permanently deleted yet");
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
export default new PostsService();
