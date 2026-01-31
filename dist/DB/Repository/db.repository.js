"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseRepository = void 0;
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
    async find({ filter, select, options, }) {
        const doc = this.model.find(filter).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async pagination({ filter = {}, options = {}, select = {}, page = 1, size = 5, }) {
        let docsCount = undefined;
        let pages = undefined;
        options = options || {};
        page = Math.floor(page < 1 ? 1 : page);
        options.limit = Math.floor(size < 1 || !size ? 5 : size);
        options.skip = (page - 1) * options?.limit;
        docsCount = await this.model.countDocuments(filter);
        pages = Math.ceil(docsCount / options?.limit);
        const results = await this.find({ filter, select, options });
        return {
            page,
            size,
            docsCount,
            pages,
            results,
        };
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
    async findOneAndUpdate({ filter, update, options, }) {
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { _v: 1 } }, { new: true, ...options });
    }
    async hardDelete({ id }) {
        return await this.model.findByIdAndDelete(id);
    }
}
exports.DataBaseRepository = DataBaseRepository;
