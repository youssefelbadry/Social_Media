import { IAuthSocket } from "../Getway/getway.dto";
import * as z from "zod";
import {
  createGroubSchema,
  getChatSchema,
  getGroupSchema,
} from "./chat.validation";
import { Server } from "socket.io";

export interface ISayHiDTO {
  message: string;
  socket: IAuthSocket;
  callback: any;
  io: Server;
}
export interface createGroupChat {
  message: string;
  socket: IAuthSocket;
  callback: any;
  io: Server;
}
export interface IsendMessageDTO {
  content: string;
  socket: IAuthSocket;
  sendTo: string;
  io: Server;
}

export interface IsendGroupMessageDTO {
  content: string;
  socket: IAuthSocket;
  roomId: string;
  io: Server;
}
export interface IJoinRoomDTO {
  roomId: string;
  socket: IAuthSocket;
  io: Server;
}

export type IGetChatSchema = z.infer<typeof getChatSchema.params>;
export type ICreateGroupSchema = z.infer<typeof createGroubSchema.body>;
export type IGetGroupSchema = z.infer<typeof getGroupSchema.params>;
