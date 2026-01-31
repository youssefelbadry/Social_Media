"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postModel = exports.postSchema = exports.LikesUNLikes = exports.AllowedComments = exports.Avaibility = exports.AlLowedComments = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("./user.model");
var AlLowedComments;
(function (AlLowedComments) {
    AlLowedComments["ALLOW"] = "ALLOW";
    AlLowedComments["DENTY"] = "DENTY ";
})(AlLowedComments || (exports.AlLowedComments = AlLowedComments = {}));
var Avaibility;
(function (Avaibility) {
    Avaibility["PUBLIC"] = "PUBLIC";
    Avaibility["FRIENDS"] = "FRIENDS";
    Avaibility["ONLY"] = "ONLY";
})(Avaibility || (exports.Avaibility = Avaibility = {}));
var AllowedComments;
(function (AllowedComments) {
    AllowedComments["ALLOW"] = "ALLOW";
    AllowedComments["DENY"] = "DENY";
})(AllowedComments || (exports.AllowedComments = AllowedComments = {}));
var LikesUNLikes;
(function (LikesUNLikes) {
    LikesUNLikes["LIKE"] = "LIKE";
    LikesUNLikes["UNLIKE"] = "UNLIKE";
})(LikesUNLikes || (exports.LikesUNLikes = LikesUNLikes = {}));
exports.postSchema = new mongoose_1.Schema({
    content: {
        type: String,
        trim: true,
        maxlength: 50000,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: [
        {
            type: String,
        },
    ],
    allowedComment: {
        type: String,
        enum: Object.values(AllowedComments),
        default: AllowedComments.ALLOW,
    },
    availability: {
        type: String,
        enum: Object.values(Avaibility),
        default: Avaibility.PUBLIC,
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
        },
    ],
    createdBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
    },
    freezeBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
    },
    freezeAt: {
        type: Date,
    },
    freezeReason: {
        type: String,
        enum: Object.values(user_model_1.ReasonEnum),
    },
    restoreBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
    },
    restoreAt: {
        type: Date,
    },
    deletedBy: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    deletedAt: {
        type: Date,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.postModel = mongoose_1.models.post || (0, mongoose_1.model)("Post", exports.postSchema);
