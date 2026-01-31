"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGetWay = void 0;
const chat_event_1 = require("./chat.event");
class ChatGetWay {
    _ChatEvent = new chat_event_1.ChatEvents();
    constructor() { }
    register = (socket, io) => {
        this._ChatEvent.sayHi(socket, io);
        this._ChatEvent.sendMessage(socket, io);
    };
}
exports.ChatGetWay = ChatGetWay;
