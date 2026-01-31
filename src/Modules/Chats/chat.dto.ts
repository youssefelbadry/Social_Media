import { IAuthSocket } from "../Getway/getway.dto";
import * as z from "zod";
import { getChatSchema } from "./chat.validation";

export interface ISayHiDTO {
  message: string;
  socket: IAuthSocket;
  callback: any;
}

export interface IsendMessageDTO {
  content: string;
  socket: IAuthSocket;
  sendTo: string;
}

export type IGetChatSchema = z.infer<typeof getChatSchema.params>;
