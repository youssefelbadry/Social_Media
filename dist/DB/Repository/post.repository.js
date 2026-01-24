"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRepository = void 0;
const db_repository_1 = require("./db.repository");
const error_res_1 = require("../../Utils/Responsive/error.res");
class postRepository extends db_repository_1.DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createPost({ data = [], options = {}, }) {
        const [post] = (await this.create({ data, options })) || [];
        if (!post)
            throw new error_res_1.BadRequestException("Fail to create post");
        return post;
    }
}
exports.postRepository = postRepository;
