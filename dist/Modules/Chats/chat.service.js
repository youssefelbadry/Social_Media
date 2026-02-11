"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const chat_repository_1 = require("../../DB/Repository/chat.repository");
const chat_model_1 = require("../../DB/Models/chat.model");
const user_model_1 = require("../../DB/Models/user.model");
const user_repository_1 = require("../../DB/Repository/user.repository");
const mongoose_1 = require("mongoose");
const error_res_1 = require("../../Utils/Responsive/error.res");
const uuid_1 = require("uuid");
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
    createGroup = async (req, res) => {
        const { participants, group } = req.body;
        if (!group?.trim()) {
            throw new error_res_1.BadRequestException("Group name is required");
        }
        const dbparticipants = participants.map((participant) => {
            return new mongoose_1.Types.ObjectId(participant);
        });
        const users = await this._userModel.find({
            filter: {
                _id: { $in: dbparticipants },
                friends: { $in: [req.user?._id] },
            },
        });
        if (participants.length !== users.length) {
            throw new error_res_1.BadRequestException("Some users are not your friends");
        }
        const roomId = (0, uuid_1.v4)();
        const [chatGroup] = (await this._chatModel.create({
            data: [
                {
                    createdBy: req.user?._id,
                    participants: [...dbparticipants, req.user?._id],
                    roomId,
                    group_name: group,
                },
            ],
        })) || [];
        if (!chatGroup)
            throw new error_res_1.BadRequestException("The group is not created");
        return res.status(200).json({
            message: "Group created successfully",
            data: { chatGroup },
        });
    };
    getGroup = async (req, res) => {
        const { groupId } = req.params;
        const groupChat = await this._chatModel.findOne({
            filter: {
                _id: new mongoose_1.Types.ObjectId(groupId),
                group_name: { $exists: true },
                participants: { $in: [req.user?._id] },
            },
            options: {
                populate: "messages.createdBy",
            },
        });
        if (!groupChat)
            throw new error_res_1.NotFoundException("Group is not exsist");
        return res.status(200).json({
            message: "Done",
            data: groupChat || null,
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
            const sender = await this._userModel.findOne({
                filter: { _id: createdBy },
            });
            socket.emit("successMessage", {
                content,
                createdBy: {
                    _id: createdBy,
                    username: socket.Credentials?.user?.username,
                },
            });
            io.emit("newMessage", {
                content,
                createdBy: {
                    _id: createdBy,
                    username: sender?.username,
                },
            });
        }
        catch (error) {
            socket.emit("sendMessage", error);
        }
    };
    joinRoom = async ({ roomId, socket, io }) => {
        try {
            const chat = await this._chatModel.findOne({
                filter: {
                    roomId,
                    participants: {
                        $in: [socket.Credentials?.user?._id],
                    },
                    group_name: { $exists: true },
                },
            });
            if (!chat)
                throw new error_res_1.BadRequestException("Fail to join into the group");
            socket.join(chat.roomId);
        }
        catch (error) {
            socket.emit("sendMessage", error);
        }
    };
    sendGroupMessage = async ({ content, socket, roomId, io, }) => {
        try {
            const createdBy = socket.Credentials?.user?._id;
            const chat = await this._chatModel.findOneAndUpdate({
                filter: {
                    roomId,
                    participants: { $in: [createdBy] },
                    group_name: { $exists: true },
                },
                update: {
                    $push: {
                        messages: {
                            content,
                            createdBy,
                            createdAt: new Date(),
                        },
                    },
                },
                options: { new: true },
            });
            if (!chat)
                throw new error_res_1.NotFoundException("Group not found");
            socket.emit("successMessage", {
                content,
                from: {
                    _id: createdBy,
                    username: socket.Credentials?.user?.username,
                },
            });
            socket.to(roomId).emit("newMessage", {
                content,
                from: {
                    _id: createdBy,
                    username: socket.Credentials?.user?.username,
                },
                groupId: roomId,
            });
        }
        catch (error) {
            socket.emit("sendMessageError", error);
        }
    };
}
exports.ChatService = ChatService;
exports.default = new ChatService();
