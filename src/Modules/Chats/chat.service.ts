import { Request, Response } from "express";
import {
  ICreateGroupSchema,
  IGetChatSchema,
  IGetGroupSchema,
  IJoinRoomDTO,
  ISayHiDTO,
  IsendGroupMessageDTO,
  IsendMessageDTO,
} from "./chat.dto";
import { chatRepository } from "../../DB/Repository/chat.repository";
import { chatModel } from "../../DB/Models/chat.model";
import { userModel } from "../../DB/Models/user.model";
import { userRepository } from "../../DB/Repository/user.repository";
import { Types } from "mongoose";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/Responsive/error.res";
import { v4 as uuid } from "uuid";

export class ChatService {
  private _chatModel = new chatRepository(chatModel);
  private _userModel = new userRepository(userModel);
  constructor() {}

  // Rest Api
  getChat = async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };

    const chat = await this._chatModel.findOne({
      filter: {
        participants: {
          $all: [req.user!._id, new Types.ObjectId(userId)],
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
  createGroup = async (req: Request, res: Response) => {
    const { participants, group } = req.body as ICreateGroupSchema;

    if (!group?.trim()) {
      throw new BadRequestException("Group name is required");
    }
    const dbparticipants = participants.map((participant) => {
      return new Types.ObjectId(participant);
    });

    const users = await this._userModel.find({
      filter: {
        _id: { $in: dbparticipants },
        friends: { $in: [req.user?._id as Types.ObjectId] },
      },
    });

    if (participants.length !== users.length) {
      throw new BadRequestException("Some users are not your friends");
    }

    const roomId = uuid();

    const [chatGroup] =
      (await this._chatModel.create({
        data: [
          {
            createdBy: req.user?._id as Types.ObjectId,
            participants: [...dbparticipants, req.user?._id as Types.ObjectId],
            roomId,
            group_name: group,
          },
        ],
      })) || [];

    if (!chatGroup) throw new BadRequestException("The group is not created");

    return res.status(200).json({
      message: "Group created successfully",
      data: { chatGroup },
    });
  };
  getGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params as IGetGroupSchema;

    const groupChat = await this._chatModel.findOne({
      filter: {
        _id: new Types.ObjectId(groupId),
        group_name: { $exists: true },
        participants: { $in: [req.user?._id as Types.ObjectId] },
      },
      options: {
        populate: "messages.createdBy",
      },
    });
    if (!groupChat) throw new NotFoundException("Group is not exsist");

    return res.status(200).json({
      message: "Done",
      data: groupChat || null,
    });
  };
  // IO Service
  sayHi = ({ message, socket, callback }: ISayHiDTO) => {
    try {
      console.log(message);
      callback ? callback("I Recived your message") : undefined;
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };
  sendMessage = async ({ content, socket, sendTo, io }: IsendMessageDTO) => {
    try {
      const createdBy = socket.Credentials?.user?._id as Types.ObjectId;

      const user = await this._userModel.findOne({
        filter: {
          _id: new Types.ObjectId(sendTo),
          friends: { $in: [createdBy] },
        },
      });

      if (!user) throw new NotFoundException("User not found");

      const chat = await this._chatModel.findOneAndUpdate({
        filter: {
          participants: {
            $all: [createdBy as Types.ObjectId, new Types.ObjectId(sendTo)],
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
        const [createChat] =
          (await this._chatModel.create({
            data: [
              {
                createdBy,
                messages: [
                  {
                    content,
                    createdBy,
                  } as any,
                ],
                participants: [createdBy, new Types.ObjectId(sendTo)],
              },
            ],
          })) || [];

        if (!createChat) throw new BadRequestException("Fail to create chat");
      }

      const sender = await this._userModel.findOne({
        filter: { _id: createdBy },
      });

      socket.emit("successMessage", {
        content,
        createdBy: {
          _id: createdBy,
          username: socket.Credentials?.user?.username,
          // profilePicture: socket.Credentials.user.profilePicture,
        },
      });

      io.emit("newMessage", {
        content,
        createdBy: {
          _id: createdBy,
          username: sender?.username,
          // profilePicture: sender?.profilePicture,
        },
      });
    } catch (error) {
      socket.emit("sendMessage", error);
    }
  };
  joinRoom = async ({ roomId, socket, io }: IJoinRoomDTO) => {
    try {
      const chat = await this._chatModel.findOne({
        filter: {
          roomId,
          participants: {
            $in: [socket.Credentials?.user?._id as Types.ObjectId],
          },
          group_name: { $exists: true },
        },
      });

      if (!chat) throw new BadRequestException("Fail to join into the group");

      socket.join(chat.roomId as string);
    } catch (error) {
      socket.emit("sendMessage", error);
    }
  };

  sendGroupMessage = async ({
    content,
    socket,
    roomId,
    io,
  }: IsendGroupMessageDTO) => {
    try {
      const createdBy = socket.Credentials?.user?._id as Types.ObjectId;

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

      if (!chat) throw new NotFoundException("Group not found");

      // sender فقط
      socket.emit("successMessage", {
        content,
        from: {
          _id: createdBy,
          username: socket.Credentials?.user?.username,
        },
      });

      // باقي الجروب
      socket.to(roomId).emit("newMessage", {
        content,
        from: {
          _id: createdBy,
          username: socket.Credentials?.user?.username,
        },
        groupId: roomId,
      });
    } catch (error) {
      socket.emit("sendMessageError", error);
    }
  };
}

export default new ChatService();
