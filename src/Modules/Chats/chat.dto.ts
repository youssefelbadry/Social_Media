import { IAuthSocket } from "../Getway/getway.dto";
import * as z from "zod";
import { getChatSchema } from "./chat.validation";
import { Server } from "socket.io";

export interface ISayHiDTO {
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

export type IGetChatSchema = z.infer<typeof getChatSchema.params>;
