import { Request, Response } from "express";
import { userRepository } from "../../DB/Repository/user.repository";
import { userModel } from "../../DB/Models/user.model";
import { Avaibility, HPostDoc, postModel } from "../../DB/Models/post.model";
import { postRepository } from "../../DB/Repository/post.repository";
import {
  BadRequestException,
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
            createdBy: req.decoded?.id,
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
}
export default new PostsService();
