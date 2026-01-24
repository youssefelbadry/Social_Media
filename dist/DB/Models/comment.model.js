"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentModel = exports.commentSchema = exports.LikesUNLikes = void 0;
const mongoose_1 = require("mongoose");
var LikesUNLikes;
(function (LikesUNLikes) {
    LikesUNLikes["LIKE"] = "LIKE";
    LikesUNLikes["UNLIKE"] = "UNLIKE";
})(LikesUNLikes || (exports.LikesUNLikes = LikesUNLikes = {}));
exports.commentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        trim: true,
        maxlength: 50000,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: {
        type: [String],
        default: [],
    },
    assitFolderId: { type: String },
    tags: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    likes: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
            default: [],
        },
    ],
    createdBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    freezeBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
    },
    freezeAt: { type: Date },
    restoreBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
    },
    restoreAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.commentModel = mongoose_1.models.Comment || (0, mongoose_1.model)("Comment", exports.commentSchema);
