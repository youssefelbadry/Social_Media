"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRepository = void 0;
const db_repository_1 = require("./db.repository");
const error_res_1 = require("../../Utils/Responsive/error.res");
class commentRepository extends db_repository_1.DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createComment({ data = [], options = {}, }) {
        const [post] = (await this.create({ data, options })) || [];
        if (!post)
            throw new error_res_1.BadRequestException("Fail to create post");
        return post;
    }
}
exports.commentRepository = commentRepository;
