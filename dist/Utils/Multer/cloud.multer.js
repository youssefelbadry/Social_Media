"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloufFileUploud = exports.storgeFilter = exports.filterFile = void 0;
const multer_1 = __importDefault(require("multer"));
const node_os_1 = __importDefault(require("node:os"));
const uuid_1 = require("uuid");
const error_res_1 = require("../Responsive/error.res");
exports.filterFile = {
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
    pdf: [],
    document: [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        "application/pdf",
    ],
    video: [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
        "video/webm",
    ],
    audio: [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/webm",
        "audio/mp4",
    ],
    archive: [
        "application/zip",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
        "application/x-tar",
        "application/gzip",
    ],
    code: [
        "application/json",
        "application/javascript",
        "text/javascript",
        "text/html",
        "text/css",
    ],
};
var storgeFilter;
(function (storgeFilter) {
    storgeFilter["MEMORY"] = "MEMORY";
    storgeFilter["DISK"] = "DISK";
})(storgeFilter || (exports.storgeFilter = storgeFilter = {}));
const cloufFileUploud = ({ validation = [], storgeApproch = storgeFilter.MEMORY, maxSizeMB = 2, }) => {
    const storage = storgeApproch === storgeFilter.MEMORY
        ? multer_1.default.memoryStorage()
        : multer_1.default.diskStorage({
            destination: node_os_1.default.tmpdir(),
            filename: (req, file, cb) => {
                cb(null, `${(0, uuid_1.v4)()}-${file.originalname}`);
            },
        });
    function fileFilter(req, file, cb) {
        if (!validation.includes(file.mimetype)) {
            return cb(new error_res_1.BadRequestException("Invalid file type"));
        }
        return cb(null, true);
    }
    return (0, multer_1.default)({
        fileFilter,
        storage,
        limits: {
            fileSize: maxSizeMB * 1024 * 1024,
        },
    });
};
exports.cloufFileUploud = cloufFileUploud;
