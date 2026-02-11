"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatModel = exports.messageModel = exports.chatSchema = exports.messageSchema = void 0;
const mongoose_1 = require("mongoose");
exports.messageSchema = new mongoose_1.Schema({
    content: {
        type: [String],
        required: true,
        trim: true,
    },
    createdBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.chatSchema = new mongoose_1.Schema({
    participants: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    messages: [exports.messageSchema],
    group_name: {
        type: String,
        trim: true,
    },
    groups_image: String,
    roomId: {
        type: String,
        unique: true,
        sparse: true,
    },
    createdBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.messageModel = mongoose_1.models.Message || (0, mongoose_1.model)("Message", exports.messageSchema);
exports.chatModel = mongoose_1.models.Chat || (0, mongoose_1.model)("Chat", exports.chatSchema);
