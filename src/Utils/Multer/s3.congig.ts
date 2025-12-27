import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { Upload } from "@aws-sdk/lib-storage";

import { storgeFilter } from "./cloud.multer";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../Responsive/error.res";
export const s3Congig = () => {
  return new S3Client({
    region: process.env.REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY as string,
      secretAccessKey: process.env.AWS_SECRET_KEY as string,
    },
  });
};

export const uploadFile = async ({
  storgeApproch = storgeFilter.MEMORY,
  Bucket = process.env.BUCKET,
  ACL = "private",
  path = "general",
  file,
}: {
  storgeApproch?: storgeFilter;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path: string;
  file: Express.Multer.File;
}) => {
  const commend = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APP_NAME}/${path}/${uuid()}-${file.originalname}`,
    Body: storgeApproch === storgeFilter.MEMORY ? file.buffer : file.path,
    ContentType: file.mimetype,
  });
  await s3Congig().send(commend);

  if (!commend?.input?.Key) throw new BadRequestException("Faild upload file");

  return commend.input.Key;
};
export const uploadLargeFile = async ({
  storgeApproch = storgeFilter.MEMORY,
  Bucket = process.env.BUCKET,
  ACL = "private",
  path = "general",
  file,
}: {
  storgeApproch?: storgeFilter;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path: string;
  file: Express.Multer.File;
}) => {
  const fileKey = `${process.env.APP_NAME}/${path}/${uuid()}-${
    file.originalname
  }`;
  const upload = new Upload({
    client: s3Congig(),
    params: {
      Bucket,
      ACL,
      Key: fileKey,
      Body: storgeApproch === storgeFilter.MEMORY ? file.buffer : file.path,
      ContentType: file.mimetype,
    },
    partSize: 500 * 1024 * 1024,
  });
  upload.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });

  await upload.done();
  if (!fileKey) throw new BadRequestException("Faild upload file");

  return fileKey;
};

export const uploadFiles = async ({
  storgeApproch = storgeFilter.MEMORY,
  Bucket = process.env.BUCKET,
  ACL = "private",
  path = "general",
  files,
}: {
  storgeApproch?: storgeFilter;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path: string;
  files: Express.Multer.File[];
}) => {
  let urls: string[] = [];

  urls = await Promise.all(
    files.map((file) => {
      return uploadFile({
        storgeApproch,
        Bucket: Bucket || process.env.BUCKET || "default-bucket",
        ACL,
        path,
        file,
      });
    })
  );
};
