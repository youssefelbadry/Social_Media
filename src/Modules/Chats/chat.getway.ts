import { IAuthSocket } from "../Getway/getway.dto";
import { ChatEvents } from "./chat.event";

export class ChatGetWay {
  private _ChatEvent = new ChatEvents();
  constructor() {}

  register = (socket: IAuthSocket) => {
    this._ChatEvent.sayHi(socket);
  };
}
