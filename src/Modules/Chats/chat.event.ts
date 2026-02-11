import { Server } from "socket.io";
import { IAuthSocket } from "../Getway/getway.dto";
import { ChatService } from "./chat.service";

export class ChatEvents {
  private _chatService = new ChatService();
  constructor() {}

  sayHi = (socket: IAuthSocket, io: Server) => {
    return socket.on("sayHi", (message, callback) => {
      this._chatService.sayHi({ message, socket, callback, io });
    });
  };

  sendMessage = (socket: IAuthSocket, io: Server) => {
    return socket.on(
      "sendMessage",
      (data: { content: string; sendTo: string }) => {
        this._chatService.sendMessage({ ...data, socket, io });
      },
    );
  };

  joinRoom = (socket: IAuthSocket, io: Server) => {
    return socket.on("join_room", (data: { roomId: string }) => {
      this._chatService.joinRoom({ ...data, socket, io });
    });
  };
  sendGroupMessage = (socket: IAuthSocket, io: Server) => {
    return socket.on(
      "sendGroupMessage",
      (data: { content: string; roomId: string }) => {
        this._chatService.joinRoom({ ...data, socket, io });
      },
    );
  };
}
