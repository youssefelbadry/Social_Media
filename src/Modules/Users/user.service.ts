import { Request, Response } from "express";

class UserService {
  constructor() {}

  //getProfile=========================================================
  getProfile = async (req: Request, res: Response) => {
    return res.status(200).json({
      message: "Done",
      data: { user: req.user, decoded: req.decoded },
    });
  };
}

export default new UserService();
