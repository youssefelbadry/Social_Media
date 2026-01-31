"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsRepository = void 0;
const db_repository_1 = require("./db.repository");
const error_res_1 = require("../../Utils/Responsive/error.res");
class FriendsRepository extends db_repository_1.DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createFriends({ data = [], options = {}, }) {
        const [addfriend] = (await this.create({ data, options })) || [];
        if (!addfriend)
            throw new error_res_1.BadRequestException("Fail to send add friend");
        return addfriend;
    }
}
exports.FriendsRepository = FriendsRepository;
