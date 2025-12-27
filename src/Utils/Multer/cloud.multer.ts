import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import os from "node:os";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../Responsive/error.res";

export const filterFile = {
  // 🖼 Images
  image: [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/svg+xml",
    "image/tiff",
  ],

  // 📄 Documents
  pdf: [],

  document: [
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "text/plain", // .txt
    "text/csv", // .csv
    "application/pdf",
  ],

  // 🎥 Videos
  video: [
    "video/mp4",
    "video/mpeg",
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi
    "video/x-matroska", // .mkv
    "video/webm",
  ],

  // 🎵 Audio
  audio: [
    "audio/mpeg", // mp3
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "audio/mp4",
  ],

  // 📦 Archives
  archive: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-tar",
    "application/gzip",
  ],

  // 🧑‍💻 Code files
  code: [
    "application/json",
    "application/javascript",
    "text/javascript",
    "text/html",
    "text/css",
  ],
};

export enum storgeFilter {
  MEMORY = "MEMORY",
  DISK = "DISK",
}
export const cloufFileUploud = ({
  validation = [],
  storgeApproch = storgeFilter.MEMORY,
  maxSizeMB = 2,
}: {
  validation?: string[];
  storgeApproch?: storgeFilter;
  maxSizeMB?: number;
}) => {
  const storage =
    storgeApproch === storgeFilter.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: os.tmpdir(),
          filename: (req: Request, file: Express.Multer.File, cb) => {
            cb(null, `${uuid()}-${file.originalname}`);
          },
        });

  function fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) {
    if (!validation.includes(file.mimetype)) {
      return cb(new BadRequestException("Invalid file type"));
    }
    return cb(null, true);
  }

  return multer({
    fileFilter,
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
  });
};
