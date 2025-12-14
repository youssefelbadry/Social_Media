"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandling = exports.ConflictException = exports.NotFoundException = exports.BadRequestException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    statuscode;
    constructor(message, statuscode = 400, options) {
        super(message, options);
        this.statuscode = statuscode;
        this.name = this.constructor.name;
    }
}
exports.ApplicationException = ApplicationException;
class BadRequestException extends ApplicationException {
    constructor(message, options) {
        super(message, 400, options);
    }
}
exports.BadRequestException = BadRequestException;
class NotFoundException extends ApplicationException {
    constructor(message, options) {
        super(message, 404, options);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends ApplicationException {
    constructor(message, options) {
        super(message, 409, options);
    }
}
exports.ConflictException = ConflictException;
const globalErrorHandling = (err, req, res, next) => {
    return res.status(err.statuscode || 500).json({
        message: err.message,
        stack: process.env.MODE === "DEV" ? err.stack : undefined,
        cause: err.cause,
    });
};
exports.globalErrorHandling = globalErrorHandling;
