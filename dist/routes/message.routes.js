"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const VerifyToken_1 = require("../middlewares/VerifyToken");
const message_controller_1 = require("../controllers/message.controller");
const uploader_1 = require("../middlewares/uploader");
const messageRoutes = express_1.default.Router();
exports.messageRoutes = messageRoutes;
messageRoutes.post('/group/:groupId', VerifyToken_1.verifyToken, uploader_1.uploaderForChats, message_controller_1.sendGroupMessage);
messageRoutes.post('/single/:receiverId', VerifyToken_1.verifyToken, uploader_1.uploaderForChats, message_controller_1.sendSingleMessage);
messageRoutes.put('/read/:id', VerifyToken_1.verifyToken, message_controller_1.markMessagesAsRead);
messageRoutes.put('/like/:id', VerifyToken_1.verifyToken, message_controller_1.toggleLikeMessage);
messageRoutes.put('/pin/:id', VerifyToken_1.verifyToken, message_controller_1.togglePinMessage);
messageRoutes.get('/single/:id', VerifyToken_1.verifyToken, message_controller_1.getSingleMessage);
messageRoutes.get('/last/:id', VerifyToken_1.verifyToken, message_controller_1.getLastMessage);
messageRoutes.post('/search/:id', VerifyToken_1.verifyToken, message_controller_1.searchMessages);
messageRoutes.route('/:id')
    .get(VerifyToken_1.verifyToken, message_controller_1.getMessagesByChat);
messageRoutes.delete('/:id', VerifyToken_1.verifyToken, message_controller_1.deleteMessage);
