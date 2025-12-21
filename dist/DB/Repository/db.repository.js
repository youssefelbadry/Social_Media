"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = exports.DataBaseRepository = void 0;
class DataBaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async findOne({ filter, select, options, }) {
        const doc = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async findById({ id, select, options, }) {
        const doc = this.model.findById(id).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async updateOne({ filter, update, options, }) {
        return await this.model.updateOne(filter, { ...update, $inc: { _v: 1 } }, options);
    }
}
exports.DataBaseRepository = DataBaseRepository;
class TokenRepository extends DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createTokenOut({ data, options, }) {
        return await this.model.create(data, options);
    }
    async findByJwtId(jwtid) {
        return await this.model.findOne({ jwtid });
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
