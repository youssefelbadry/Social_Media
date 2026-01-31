"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRepository = void 0;
const db_repository_1 = require("./db.repository");
class chatRepository extends db_repository_1.DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.chatRepository = chatRepository;
