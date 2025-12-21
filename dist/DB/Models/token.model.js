"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenModel = exports.tokenSchema = void 0;
const mongoose_1 = require("mongoose");
exports.tokenSchema = new mongoose_1.Schema({
    jwtid: {
        type: String || undefined,
    },
    expiresAt: {
        type: Date || Number,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId || String,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
exports.tokenModel = mongoose_1.models.Token || (0, mongoose_1.model)("Token", exports.tokenSchema);
