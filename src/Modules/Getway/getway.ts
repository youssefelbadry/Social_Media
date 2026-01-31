import { ChatGetWay } from "./../Chats/chat.getway";
import { Server as httpServer } from "node:http";
import { Server } from "socket.io";

import { decodedToken, TokenTypeEnum } from "../../Utils/Security/token";
import { IAuthSocket } from "./getway.dto";

let io: Server | null = null;
export const initialize = (httpServer: httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const connectionsSockets = new Map<string, string[]>();

  io.use(async (socket: IAuthSocket, next) => {
    try {
      const { user, decoded } = await decodedToken(
        socket.handshake.auth.authorization,
        TokenTypeEnum.ACCESS,
      );
      const userTabs = connectionsSockets.get(user._id.toString()) || [];
      userTabs.push(socket.id);
      connectionsSockets.set(user._id.toString(), userTabs);
      socket.Credentials = { user, decoded };
      next();
    } catch (error: any) {
      next(error);
    }
  });

  function disconnect(socket: IAuthSocket) {
    socket.on("disconnect", () => {
      const userId = socket.Credentials?.user?._id?.toString() as string;
      let useTabs =
        connectionsSockets.get(userId)?.filter((tab) => {
          return tab !== socket.id;
        }) || [];
      if (useTabs.length) {
        connectionsSockets.set(userId, useTabs);
      } else {
        connectionsSockets.delete(userId);
      }
      console.log(`Delete :: ${socket.id}`);
      console.log(connectionsSockets);
    });
  }

  const chatGetWay = new ChatGetWay();
  io.on("connection", (socket: IAuthSocket) => {
    console.log(connectionsSockets);
    chatGetWay.register(socket, getIo());
    console.log(`Login :: ${socket.id}`);
    disconnect(socket);
  });
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error("Socket.io not inialized");
  }
  return io;
};
