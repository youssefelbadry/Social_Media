"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModel = exports.tokenSchema = void 0;
const mongoose_1 = require("mongoose");
exports.tokenSchema = new mongoose_1.Schema({
    jti: {
        type: String,
    },
    expiresIn: {
        type: Number,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId || String,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
exports.TokenModel = mongoose_1.models.Token || (0, mongoose_1.model)("Token", exports.tokenSchema);
