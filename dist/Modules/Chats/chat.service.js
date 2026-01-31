"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const chat_repository_1 = require("../../DB/Repository/chat.repository");
const chat_model_1 = require("../../DB/Models/chat.model");
const user_model_1 = require("../../DB/Models/user.model");
const user_repository_1 = require("../../DB/Repository/user.repository");
const mongoose_1 = require("mongoose");
const error_res_1 = require("../../Utils/Responsive/error.res");
class ChatService {
    _chatModel = new chat_repository_1.chatRepository(chat_model_1.chatModel);
    _userModel = new user_repository_1.userRepository(user_model_1.userModel);
    constructor() { }
    getChat = async (req, res) => {
        const { userId } = req.params;
        const chat = await this._chatModel.findOne({
            filter: {
                participants: {
                    $all: [req.user._id, new mongoose_1.Types.ObjectId(userId)],
                },
                groups: { $exists: false },
            },
            options: {
                populate: {
                    path: "participants",
                    select: "_id profilePicture",
                },
            },
        });
        return res.status(200).json({
            message: "Done",
            data: chat || null,
        });
    };
    sayHi = ({ message, socket, callback }) => {
        try {
            console.log(message);
            callback ? callback("I Recived your message") : undefined;
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    sendMessage = async ({ content, socket, sendTo, io }) => {
        try {
            const createdBy = socket.Credentials?.user?._id;
            const user = await this._userModel.findOne({
                filter: {
                    _id: new mongoose_1.Types.ObjectId(sendTo),
                    friends: { $in: [createdBy] },
                },
            });
            if (!user)
                throw new error_res_1.NotFoundException("User not found");
            const chat = await this._chatModel.findOneAndUpdate({
                filter: {
                    participants: {
                        $all: [createdBy, new mongoose_1.Types.ObjectId(sendTo)],
                    },
                    groups: { $exists: false },
                },
                update: {
                    $addToSet: {
                        messages: {
                            content,
                            createdBy,
                        },
                    },
                },
            });
            if (!chat) {
                const [createChat] = (await this._chatModel.create({
                    data: [
                        {
                            createdBy,
                            messages: [
                                {
                                    content,
                                    createdBy,
                                },
                            ],
                            participants: [createdBy, new mongoose_1.Types.ObjectId(sendTo)],
                        },
                    ],
                })) || [];
                if (!createChat)
                    throw new error_res_1.BadRequestException("Fail to create chat");
            }
            io.emit("successMessage", { content });
            io.emit("newMessage", { content, from: socket.Credentials?.user });
        }
        catch (error) {
            socket.emit("sendMessage", error);
        }
    };
}
exports.ChatService = ChatService;
exports.default = new ChatService();
