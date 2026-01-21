import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  GetObjectAclCommand,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { Upload } from "@aws-sdk/lib-storage";

import { storgeFilter } from "./cloud.multer";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../Responsive/error.res";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
    }),
  );

  return urls;
};

export const uploadFilesByUrl = async ({
  storgeApproch = storgeFilter.MEMORY,
  Bucket = process.env.BUCKET,
  ACL = "private",
  path,
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
    files.map((file: Express.Multer.File) => {
      return uploadFile({
        storgeApproch,
        Bucket: Bucket || process.env.BUCKET || "default-bucket",
        ACL,
        path,
        file,
      });
    }),
  );

  return urls;
};

export const createPresignedUrl = async ({
  Bucket = process.env.BUCKET as string,
  path = "general",
  ContentType,
  originalName,
  expiredIn = 120,
}: {
  Bucket?: string;
  path?: string;
  ContentType: string;
  originalName: string;
  expiredIn?: number;
}) => {
  const command = new PutObjectCommand({
    Bucket: Bucket || process.env.BUCKET || "default-bucket",
    Key: `${process.env.APP_NAME}/${path}/${uuid()}-${originalName}`,
    ContentType,
  });

  const url = await getSignedUrl(s3Congig(), command, {
    expiresIn: expiredIn,
  });

  if (!url || !command.input.Key) {
    throw new BadRequestException("Fail to genearte url");
  }

  return { url, key: command.input.Key };
};

export const getFile = async ({
  Bucket = process.env.BUCKET as string,
  Key = "general",
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new GetObjectAclCommand({
    Bucket,
    Key,
  });

  return await s3Congig().send(command);
};

export const createGetPresignedUrl = async ({
  Bucket = process.env.BUCKET as string,
  Key,
  expiredIn = 120,
  downloadName = "dummy",
}: {
  Bucket?: string;
  Key: string;
  expiredIn?: number;
  downloadName?: string;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentDisposition: `attachment; fileName="${downloadName}"`,
  });

  const url = await getSignedUrl(s3Congig(), command, { expiresIn: expiredIn });
  if (!url || !command.input.Key) {
    throw new BadRequestException("Fail To generate URL");
  }

  return { url, Key: command.input.Key };
};
export const deleteFile = async ({
  Bucket = process.env.BUCKET as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}): Promise<DeleteObjectCommandOutput> => {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });

  return await s3Congig().send(command);
};
export const deleteFiles = async ({
  Bucket = process.env.BUCKET as string,
  urls,
  Quiet,
}: {
  Bucket?: string;
  urls: string[];
  Quiet?: boolean;
}): Promise<DeleteObjectCommandOutput> => {
  const Objects = urls.map((url) => {
    return { Key: url };
  });
  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet,
    },
  });

  return await s3Congig().send(command);
};
