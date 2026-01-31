"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendsModel = exports.friendsSchema = exports.FriendStatus = void 0;
const mongoose_1 = require("mongoose");
var FriendStatus;
(function (FriendStatus) {
    FriendStatus["PENDING"] = "PENDING";
    FriendStatus["ACCEPTED"] = "ACCEPTED";
    FriendStatus["REJECTED"] = "REJECTED";
    FriendStatus["BLOCKED"] = "BLOCKED";
})(FriendStatus || (exports.FriendStatus = FriendStatus = {}));
exports.friendsSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(FriendStatus),
        default: FriendStatus.PENDING,
    },
    acceptedAt: Date,
    blockedAt: Date,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.friendsModel = mongoose_1.models.Friends || (0, mongoose_1.model)("Friends", exports.friendsSchema);
