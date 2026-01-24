import { v2 as cloudinary } from "cloudinary";
// import { Request, Response } from "express";

export const cloudinaryConfig = async () => {
  cloudinary.config({
    cloud_name: (process.env.CLOUD_NAME as string) || "",
    api_key: (process.env.API_KEY as string) || "",
    api_secret: (process.env.API_SECRET! as string) || "",
  });
  return cloudinary;
};

// class cloudConfig {
//   constructor() {}
//   uploadFile = async (req: Request, res: Response) => {

//   };
// }
