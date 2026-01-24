"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3_congig_1 = require("./s3.congig");
const error_res_1 = require("../Responsive/error.res");
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const createS3writeStreamPipe = (0, node_util_1.promisify)(node_stream_1.pipeline);
class Config {
    getFileConfig = async (req, res) => {
        const { downloadName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const s3Res = (await (0, s3_congig_1.getFile)({ Key }));
        if (!s3Res?.Body) {
            throw new error_res_1.BadRequestException("Fail to fetch asset");
        }
        if (s3Res.ContentType) {
            res.setHeader("Content-Type", s3Res.ContentType);
        }
        if (downloadName) {
            res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
        }
        return await createS3writeStreamPipe(s3Res.Body, res);
    };
    getsignedFile = async (req, res) => {
        const { downloadName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const url = await (0, s3_congig_1.createGetPresignedUrl)({ Key });
        if (downloadName) {
            res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
        }
        return res.status(200).json({ message: "Done", url });
    };
    deleteFile = async (req, res) => {
        const { Key } = req.query;
        const result = await (0, s3_congig_1.deleteFile)({ Key: Key });
        return res.status(200).json({ message: "Done", result });
    };
    deleteFiles = async (req, res) => {
        const { path } = req.query;
        const result = await (0, s3_congig_1.deleteFiles)({ urls: path });
        return res.status(200).json({ message: "Done", result });
    };
}
exports.default = new Config();
