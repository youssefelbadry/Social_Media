"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const socket_io_1 = require("socket.io");
const token_1 = require("../../Utils/Security/token");
const initialize = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    const connectionsSockets = new Map();
    io.use(async (socket, next) => {
        try {
            const { user, decoded } = await (0, token_1.decodedToken)(socket.handshake.auth.authorization, token_1.TokenTypeEnum.ACCESS);
            const userTabs = connectionsSockets.get(user._id.toString()) || [];
            userTabs.push(socket.id);
            connectionsSockets.set(user._id.toString(), userTabs);
            socket.Credentials = { user, decoded };
            next();
        }
        catch (error) {
            next(error);
        }
    });
    function disconnect(socket) {
        socket.on("disconnect", () => {
            const userId = socket.Credentials?.user?._id?.toString();
            let useTabs = connectionsSockets.get(userId)?.filter((tab) => {
                return tab !== socket.id;
            }) || [];
            if (useTabs.length) {
                connectionsSockets.set(userId, useTabs);
            }
            else {
                connectionsSockets.delete(userId);
            }
            console.log(`Delete :: ${socket.id}`);
            console.log(connectionsSockets);
        });
    }
    io.on("connection", (socket) => {
        console.log(connectionsSockets);
        console.log(`Login :: ${socket.id}`);
        disconnect(socket);
    });
};
exports.initialize = initialize;
