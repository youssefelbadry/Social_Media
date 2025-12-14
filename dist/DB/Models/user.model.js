"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.userSchema = exports.Role = exports.GenderEnum = void 0;
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
    userName: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters"],
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
    role: {
        type: String,
        enum: {
            values: Object.values(Role),
            message: "Role must be USER or ADMIN",
        },
        default: Role.USER,
    },
    confirmEmailOTP: {
        type: String,
    },
    resetPasswordOTP: {
        type: String,
    },
    confirmedAt: {
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
    const [firstName, lastname] = value.split(" ") || [];
    this.set({ firstName, lastname });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.userModel = mongoose_1.models.user || (0, mongoose_1.model)("User", exports.userSchema);
