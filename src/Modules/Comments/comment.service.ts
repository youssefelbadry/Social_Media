import { Request, Response } from "express";
import {
  createPresignedUrl,
  uploadFile,
  uploadFiles,
} from "../../Utils/Multer/s3.congig";
import { userRepository } from "../../DB/Repository/user.repository";
import { userModel } from "../../DB/Models/user.model";
import { postRepository } from "../../DB/Repository/post.repository";
import { AllowedComments, postModel } from "../../DB/Models/post.model";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/Responsive/error.res";
import { cloudinaryConfig } from "../../Utils/Multer/cloudinary.config";
import { commentModel, HCommentDoc } from "../../DB/Models/comment.model";
import { commentRepository } from "../../DB/Repository/comment.repository";
import { UpdateQuery } from "mongoose";

class UserService {
  private _userModel = new userRepository(userModel);
  private _postModel = new postRepository(postModel);
  private _commenetModel = new commentRepository(commentModel);
  constructor() {}
  createComment = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: string };
    const checkPost = await this._postModel.findOne({
      filter: {
        _id: postId,
        allowedComment: AllowedComments.ALLOW,
      },
    });

    if (!checkPost) throw new NotFoundException("Post not found");

    if (
      req.body.tags?.length &&
      !(await this._userModel.findById({ id: req.body.tags }))
    ) {
      throw new BadRequestException("Some mentions is not exsists");
    }
    let attachments: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length) {
      const cloudinary = await cloudinaryConfig();

      for (const file of req.files as Express.Multer.File[]) {
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

    if (!createComment) throw new BadRequestException("Fail to create comment");

    return res.status(201).json({
      message: "Comment created successfully",
      comment: createComment,
    });
  };

  likeComment = async (req: Request, res: Response) => {
    const { commentId } = req.params as unknown as { commentId: string };

    const comment = await this._commenetModel.findById({ id: commentId });
    if (!comment) throw new NotFoundException("Comment not found");

    const alreadyLiked = comment.likes?.some(
      (id) => id.toString() === req.user?._id.toString(),
    );

    const update: UpdateQuery<HCommentDoc> = alreadyLiked
      ? { $pull: { likes: req.user?._id } }
      : { $addToSet: { likes: req.user?._id } };

    const updated = await this._commenetModel.findOneAndUpdate({
      filter: { _id: commentId },
      update,
      options: { new: true },
    });

    if (!updated)
      throw new BadRequestException("Error toggling like for this comment");

    return res.status(200).json({
      message: alreadyLiked ? "Unliked" : "Liked",
      likes: updated.likes,
      numLikes: updated.likes?.length,
    });
  };
}

export default new UserService();
