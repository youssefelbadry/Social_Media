"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePostSchema = exports.createPostSchema = void 0;
const z = __importStar(require("zod"));
const mongoose_1 = require("mongoose");
const validation_middlware_1 = require("../../Middlewares/validation.middlware");
exports.createPostSchema = {
    body: z
        .strictObject({
        content: z.string().max(2000).optional(),
        allowedComment: z.enum(["ALLOW", "DENY"]).default("ALLOW"),
        availability: z.enum(["PUBLIC", "FRIENDS", "ONLY"]).default("PUBLIC"),
        tags: z
            .array(z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid tag ObjectId",
        }))
            .optional(),
        likes: z
            .array(z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid like ObjectId",
        }))
            .optional(),
        freezeBy: z
            .string()
            .refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid freezeBy ObjectId",
        })
            .optional(),
        freezeAt: z.date().optional(),
        restoreBy: z
            .string()
            .refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid restoreBy ObjectId",
        })
            .optional(),
        restoreAt: z.date().optional(),
        attachments: z.array(z.string().url()).optional(),
    })
        .superRefine((data, ctx) => {
        if (!data.content &&
            (!data.attachments || data.attachments.length === 0)) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "Post must contain content or at least one attachment",
            });
        }
        if (data.freezeAt && !data.freezeBy) {
            ctx.addIssue({
                code: "custom",
                path: ["freezeBy"],
                message: "freezeBy is required if freezeAt exists",
            });
        }
        if (data.restoreAt && !data.restoreBy) {
            ctx.addIssue({
                code: "custom",
                path: ["restoreBy"],
                message: "restoreBy is required if restoreAt exists",
            });
        }
        if (data.tags?.length &&
            data.tags?.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "Please choose unquie tags",
            });
        }
    }),
};
exports.likePostSchema = {
    params: z.strictObject({
        postId: validation_middlware_1.generaFeild.id,
    }),
};
