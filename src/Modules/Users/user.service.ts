import { Request, Response } from "express";
import {
  createPresignedUrl,
  uploadFile,
  uploadFiles,
} from "../../Utils/Multer/s3.congig";
import { userRepository } from "../../DB/Repository/user.repository";
import { userModel } from "../../DB/Models/user.model";

class UserService {
  private _userModel = new userRepository(userModel);
  constructor() {}

  //getProfile=========================================================
  getProfile = async (req: Request, res: Response) => {
    return res.status(200).json({
      message: "Done",
      data: { user: req.user, decoded: req.decoded },
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
}

export default new UserService();
