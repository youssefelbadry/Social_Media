import { Request, Response } from "express";
import {
  createGetPresignedUrl,
  deleteFile,
  deleteFiles,
  getFile,
} from "./s3.congig";
import { BadRequestException } from "../Responsive/error.res";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { GetObjectCommandOutput } from "@aws-sdk/client-s3";
const createS3writeStreamPipe = promisify(pipeline);

class Config {
  getFileConfig = async (req: Request, res: Response) => {
    const { downloadName } = req.query;
    const { path } = req.params as unknown as { path: string[] };

    const Key = path.join("/");
    const s3Res = (await getFile({ Key })) as GetObjectCommandOutput;
    if (!s3Res?.Body) {
      throw new BadRequestException("Fail to fetch asset");
    }
    if ((s3Res as any).ContentType) {
      res.setHeader("Content-Type", (s3Res as any).ContentType as string);
    }
    if (downloadName) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadName}"`,
      );
    }
    return await createS3writeStreamPipe(
      s3Res.Body as NodeJS.ReadableStream,
      res,
    );
  };

  getsignedFile = async (req: Request, res: Response) => {
    const { downloadName } = req.query;
    const { path } = req.params as unknown as { path: string[] };

    const Key = path.join("/");
    const url = await createGetPresignedUrl({ Key });

    if (downloadName) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadName}"`,
      );
    }

    return res.status(200).json({ message: "Done", url });
  };

  deleteFile = async (req: Request, res: Response) => {
    const { Key } = req.query as { Key: string };
    const result = await deleteFile({ Key: Key as string });
    return res.status(200).json({ message: "Done", result });
  };

  deleteFiles = async (req: Request, res: Response) => {
    const { path } = req.query as { path: string[] };
    const result = await deleteFiles({ urls: path as string[] });
    return res.status(200).json({ message: "Done", result });
  };
}
export default new Config();
