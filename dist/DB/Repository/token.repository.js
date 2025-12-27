"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
const db_repository_1 = require("./db.repository");
class TokenRepository extends db_repository_1.DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createTokenOut({ data, options, }) {
        return await this.model.create(data, options);
    }
    async findByJwtId(id) {
        return await this.model.findById({ id });
    }
    async findTokenById({ jwtid, select, options, }) {
        const doc = this.model.findById(jwtid).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
}
exports.TokenRepository = TokenRepository;
