import { Server } from "socket.io";
import { IAuthSocket } from "../Getway/getway.dto";
import { ChatEvents } from "./chat.event";

export class ChatGetWay {
  private _ChatEvent = new ChatEvents();
  constructor() {}

  register = (socket: IAuthSocket, io: Server) => {
    this._ChatEvent.sayHi(socket, io);
    this._ChatEvent.sendMessage(socket, io);
  };
}
