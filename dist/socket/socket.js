"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = exports.handleLeaveRoom = exports.handleJoinRoom = exports.getUserIdFromSocketId = exports.getReceiverSocketId = exports.io = void 0;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: ["https://echat-fieq.onrender.com", "http://localhost:3000",],
        methods: ["GET", "POST", "DELETE", "PUT"],
        optionsSuccessStatus: 200,
    },
});
const userSocketMap = {};
const userRoomMap = {};
const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};
exports.getReceiverSocketId = getReceiverSocketId;
const getUserIdFromSocketId = (socketId) => {
    return Object.keys(userSocketMap).find(userId => userSocketMap[userId] === socketId);
};
exports.getUserIdFromSocketId = getUserIdFromSocketId;
const handleJoinRoom = (userId, roomId, socket) => {
    if (!userRoomMap[userId]) {
        userRoomMap[userId] = [];
    }
    if (!userRoomMap[userId].includes(roomId)) {
        socket.join(roomId);
        userRoomMap[userId].push(roomId);
        socket.emit('joined-room', { roomId });
        socket.to(roomId).emit('user-joined', { userId, roomId });
    }
};
exports.handleJoinRoom = handleJoinRoom;
const handleLeaveRoom = (userId, roomId, socket) => {
    if (userRoomMap[userId] && userRoomMap[userId].includes(roomId)) {
        socket.leave(roomId);
        userRoomMap[userId] = userRoomMap[userId].filter(id => id !== roomId); // Remove room from user's list
        socket.emit('left-room', { roomId });
    }
};
exports.handleLeaveRoom = handleLeaveRoom;
exports.io.on("connection", (socket) => {
    socket.broadcast.emit('user-connected', `New user is online socket_id : ${socket.id} possible user id ${(0, exports.getUserIdFromSocketId)(socket === null || socket === void 0 ? void 0 : socket.id)}`);
    socket.on('single-typing', ({ authName, receiverId }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiverId);
        if (receiverSocketId) {
            socket.to(receiverSocketId).emit('displaySingleTyping', { authName });
        }
    });
    socket.on('group-typing', ({ authName, authId, groupId }) => {
        var _a;
        if (groupId && authId) {
            const memberSocket = exports.io.sockets.sockets.get((0, exports.getReceiverSocketId)(authId));
            memberSocket === null || memberSocket === void 0 ? void 0 : memberSocket.join(groupId);
            (_a = memberSocket === null || memberSocket === void 0 ? void 0 : memberSocket.broadcast) === null || _a === void 0 ? void 0 : _a.to(groupId).emit('displayGroupTyping', { authName });
        }
    });
    socket.on('stop-single-typing', ({ receiverId }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiverId);
        if (receiverSocketId) {
            socket.to(receiverSocketId).emit('removeSingleTyping');
        }
    });
    socket.on('stop-group-typing', ({ groupId }) => {
        socket.broadcast.to(groupId).emit('removeGroupTyping');
    });
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
    }
    exports.io.emit("getOnlineUsers", Object.keys(userSocketMap));
    //socket signaling
    socket.on("callUser", ({ offer, sender, receiver, senderName }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiver);
        socket.to(receiverSocketId).emit("callUser2", { offer, sender, receiver, senderName });
    });
    socket.on("callVUser", ({ offer, sender, receiver, senderName }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiver);
        socket.to(receiverSocketId).emit("callVUser2", { offer, sender, receiver, senderName });
    });
    socket.on("callAnswered", ({ answer, sender, receiver }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiver);
        socket.to(receiverSocketId).emit("callAnswered2", { answer });
    });
    socket.on("callVAnswered", ({ answer, sender, receiver }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiver);
        socket.to(receiverSocketId).emit("callVAnswered2", { answer });
    });
    socket.on("iceCandidate", ({ candidate, sender, receiver }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiver);
        socket.to(receiverSocketId).emit("iceCandidate", { candidate });
    });
    socket.on("iceVCandidate", ({ candidate, sender, receiver }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiver);
        socket.to(receiverSocketId).emit("iceVCandidate", { candidate });
    });
    socket.on("endCall", ({ sender, receiver }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiver);
        const senderSocketId = (0, exports.getReceiverSocketId)(sender);
        if (receiverSocketId) {
            socket.to(receiverSocketId).emit("callEnded");
        }
        if (senderSocketId) {
            socket.to(senderSocketId).emit('callEnded');
        }
    });
    socket.on("endVCall", ({ sender, receiver }) => {
        const receiverSocketId = (0, exports.getReceiverSocketId)(receiver);
        socket.to(receiverSocketId).emit("callVEnded");
    });
    socket.on('missedCall', (data) => {
        var _a;
        const receiverSocketId = (0, exports.getReceiverSocketId)((_a = data.receiver) === null || _a === void 0 ? void 0 : _a.id);
        socket.to(receiverSocketId).emit('missed_call', data);
    });
    socket.on('missedVCall', (data) => {
        var _a;
        const receiverSocketId = (0, exports.getReceiverSocketId)((_a = data.receiver) === null || _a === void 0 ? void 0 : _a.id);
        socket.to(receiverSocketId).emit('missed_v_call', data);
    });
    socket.on("disconnect", () => {
        const userId = (0, exports.getUserIdFromSocketId)(socket.id);
        if (userRoomMap[userId]) {
            userRoomMap[userId].forEach(roomId => {
                (0, exports.handleLeaveRoom)(userId, roomId, socket);
            });
        }
        if (userId) {
            delete userSocketMap[userId];
        }
        exports.io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
