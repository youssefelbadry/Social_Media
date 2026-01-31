"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.userSchema = exports.ReasonEnum = exports.ReasonEnumUser = exports.ReasonEnumAdmin = exports.Role = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["MALE"] = "MALE";
    GenderEnum["FEMALE"] = "FEMALE";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var ReasonEnumAdmin;
(function (ReasonEnumAdmin) {
    ReasonEnumAdmin["SPAM"] = "SPAM";
    ReasonEnumAdmin["HARASSMENT"] = "HARASSMENT";
    ReasonEnumAdmin["HATE_SPEECH"] = "HATE_SPEECH";
    ReasonEnumAdmin["NUDITY"] = "NUDITY";
    ReasonEnumAdmin["SCAM"] = "SCAM";
    ReasonEnumAdmin["ADMIN_ACTION"] = "ADMIN_ACTION";
    ReasonEnumAdmin["includes"] = "includes";
})(ReasonEnumAdmin || (exports.ReasonEnumAdmin = ReasonEnumAdmin = {}));
var ReasonEnumUser;
(function (ReasonEnumUser) {
    ReasonEnumUser["USER_REQUEST"] = "USER_REQUEST";
})(ReasonEnumUser || (exports.ReasonEnumUser = ReasonEnumUser = {}));
var ReasonEnum;
(function (ReasonEnum) {
    ReasonEnum["SPAM"] = "SPAM";
    ReasonEnum["HARASSMENT"] = "HARASSMENT";
    ReasonEnum["HATE_SPEECH"] = "HATE_SPEECH";
    ReasonEnum["NUDITY"] = "NUDITY";
    ReasonEnum["SCAM"] = "SCAM";
    ReasonEnum["ADMIN_ACTION"] = "ADMIN_ACTION";
    ReasonEnum["USER_REQUEST"] = "USER_REQUEST";
    ReasonEnum["includes"] = "includes";
})(ReasonEnum || (exports.ReasonEnum = ReasonEnum = {}));
exports.userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        minlength: [2, "Last name must be at least 2 characters"],
    },
    slug: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        minlength: [5, "Last name must be at least 2 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address",
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [
            /^01[0-2,5]{1}[0-9]{8}$/,
            "Please enter a valid Egyptian phone number",
        ],
    },
    address: {
        type: String,
    },
    gender: {
        type: String,
        enum: {
            values: Object.values(GenderEnum),
            message: "Gender must be MALE or FEMALE",
        },
        required: [true, "Gender is required"],
    },
    prifileImage: String,
    role: {
        type: String,
        enum: {
            values: Object.values(Role),
            message: "Role must be USER or ADMIN",
        },
        default: Role.USER,
    },
    followers: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    friends: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    freezeBy: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    freezeAt: {
        type: Date,
    },
    freezeReason: {
        type: String,
        enum: Object.values(ReasonEnum),
    },
    restoredBy: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    restoredAt: {
        type: Date,
    },
    confirmEmailOTP: {
        type: String,
    },
    confirmEmailOTPExpiresAt: {
        type: Date,
    },
    resetPasswordOTP: {
        type: String,
    },
    confirmedAt: {
        type: Date,
    },
    changeCredientialTime: {
        type: Date,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, "-") });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.userModel = mongoose_1.models.user || (0, mongoose_1.model)("User", exports.userSchema);
