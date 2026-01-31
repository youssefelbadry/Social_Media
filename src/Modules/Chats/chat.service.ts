import { Request, Response } from "express";
import { IGetChatSchema, ISayHiDTO, IsendMessageDTO } from "./chat.dto";
import { chatRepository } from "../../DB/Repository/chat.repository";
import { chatModel } from "../../DB/Models/chat.model";
import { userModel } from "../../DB/Models/user.model";
import { userRepository } from "../../DB/Repository/user.repository";
import { Types } from "mongoose";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/Responsive/error.res";
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
      io.emit("successMessage", { content });
      io.emit("newMessage", { content, from: socket.Credentials?.user });
    } catch (error) {
      socket.emit("sendMessage", error);
    }
  };
}

export default new ChatService();
