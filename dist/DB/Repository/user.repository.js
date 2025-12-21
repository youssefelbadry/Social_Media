"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const db_repository_1 = require("./db.repository");
const error_res_1 = require("../../Utils/Responsive/error.res");
class userRepository extends db_repository_1.DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createUser({ data = [], options = {}, }) {
        const [user] = (await this.create({ data, options })) || [];
        if (!user)
            throw new error_res_1.BadRequestException("Fail to signup");
        return user;
    }
}
exports.userRepository = userRepository;
