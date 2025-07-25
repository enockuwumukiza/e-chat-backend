"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMessages = exports.getLastMessage = exports.getSingleMessage = exports.markMessagesAsRead = exports.togglePinMessage = exports.toggleLikeMessage = exports.deleteMultipleMessages = exports.deleteMessage = exports.getMessagesByChat = exports.sendSingleMessage = exports.sendGroupMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const message_model_1 = require("../models/message.model");
const group_model_1 = require("../models/group.model");
const socket_1 = require("../socket/socket");
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const conversation_model_1 = require("../models/conversation.model");
const user_model_1 = require("../models/user.model");
const uploadFileHandler_1 = require("../utils/uploadFileHandler");
// Send a group message
const sendGroupMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const { content } = req.body;
    const { groupId } = req.params;
    // Validate group existence
    const group = yield group_model_1.Group.findById(groupId);
    if (!group) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'Group not found' });
        return;
    }
    const senderId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    let messageType = "text";
    if (!senderId) {
        res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: 'Not Authorized -- login to send message'
        });
        return;
    }
    const files = req === null || req === void 0 ? void 0 : req.files;
    let image;
    let audio;
    let video;
    let normalFile;
    if (files) {
        if ((files === null || files === void 0 ? void 0 : files.photo) && ((_b = files === null || files === void 0 ? void 0 : files.photo) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            try {
                const result = yield (0, uploadFileHandler_1.uploadFileHandler)(files === null || files === void 0 ? void 0 : files.photo[0], 'image');
                messageType = 'image';
                if (result) {
                    image = {
                        id: result === null || result === void 0 ? void 0 : result.public_id,
                        url: result === null || result === void 0 ? void 0 : result.secure_url,
                        name: (_d = (_c = files === null || files === void 0 ? void 0 : files.photo[0]) === null || _c === void 0 ? void 0 : _c.originalname) === null || _d === void 0 ? void 0 : _d.toString(),
                    };
                }
            }
            catch (error) {
                res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: `Error sending image: ${error === null || error === void 0 ? void 0 : error.message}` });
                return;
            }
        }
        if ((files === null || files === void 0 ? void 0 : files.audio) && ((_e = files === null || files === void 0 ? void 0 : files.audio) === null || _e === void 0 ? void 0 : _e.length) > 0) {
            try {
                const result = yield (0, uploadFileHandler_1.uploadFileHandler)(files === null || files === void 0 ? void 0 : files.audio[0], 'raw');
                messageType = 'audio';
                if (result) {
                    audio = {
                        id: result.public_id,
                        url: result.secure_url,
                        name: (_g = (_f = files === null || files === void 0 ? void 0 : files.audio[0]) === null || _f === void 0 ? void 0 : _f.originalname) === null || _g === void 0 ? void 0 : _g.toString(),
                    };
                }
            }
            catch (error) {
                res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `error sending audio ${error === null || error === void 0 ? void 0 : error.message}`
                });
                return;
            }
        }
        if ((files === null || files === void 0 ? void 0 : files.video) && ((_h = files === null || files === void 0 ? void 0 : files.video) === null || _h === void 0 ? void 0 : _h.length) > 0) {
            try {
                const result = yield (0, uploadFileHandler_1.uploadFileHandler)(files === null || files === void 0 ? void 0 : files.video[0], 'video');
                messageType = 'video';
                if (result) {
                    video = {
                        id: result === null || result === void 0 ? void 0 : result.public_id,
                        url: result === null || result === void 0 ? void 0 : result.secure_url,
                        name: (_k = (_j = files === null || files === void 0 ? void 0 : files.video[0]) === null || _j === void 0 ? void 0 : _j.originalname) === null || _k === void 0 ? void 0 : _k.toString(),
                    };
                }
            }
            catch (error) {
                res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `error sending video: ${error === null || error === void 0 ? void 0 : error.message}`
                });
                return;
            }
        }
        if ((files === null || files === void 0 ? void 0 : files.normalFile) && ((_l = files === null || files === void 0 ? void 0 : files.normalFile) === null || _l === void 0 ? void 0 : _l.length) > 0) {
            try {
                const result = yield (0, uploadFileHandler_1.uploadFileHandler)(files.normalFile[0], 'raw');
                messageType = 'file';
                if (result) {
                    normalFile = {
                        id: result === null || result === void 0 ? void 0 : result.public_id,
                        url: result === null || result === void 0 ? void 0 : result.secure_url,
                        name: (_o = (_m = files.normalFile[0]) === null || _m === void 0 ? void 0 : _m.originalname) === null || _o === void 0 ? void 0 : _o.toString(),
                    };
                }
            }
            catch (error) {
                res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Error sending file: ${error === null || error === void 0 ? void 0 : error.message}`
                });
            }
        }
    }
    const fileUrl = messageType === 'image' ? image :
        messageType === 'audio' ? audio :
            messageType === 'video' ? video :
                messageType === 'file' ? normalFile : undefined;
    try {
        // Create and save the message
        const newMessage = new message_model_1.Message({
            sender: senderId,
            groupId,
            content,
            chatType: 'Group',
            chat: group._id,
            messageType,
            fileUrl,
        });
        yield newMessage.save();
        // Update latest message in group
        if (group && newMessage) {
            yield group.updateOne({ latestMessage: newMessage._id });
        }
        // Add message ID to the group's messages array
        group.messages.push(newMessage._id);
        yield group.save();
        // Populate sender information
        const message = yield message_model_1.Message.findById(newMessage._id).populate('sender');
        const membersOfGroup = group === null || group === void 0 ? void 0 : group.members;
        for (const member of membersOfGroup) {
            const memberSocket = socket_1.io.sockets.sockets.get((0, socket_1.getReceiverSocketId)(member === null || member === void 0 ? void 0 : member.userId));
            if (memberSocket) {
                memberSocket.join(group === null || group === void 0 ? void 0 : group._id);
                socket_1.io.to(group === null || group === void 0 ? void 0 : group._id).emit('group-message', message);
            }
        }
        res.status(httpStatusCodes_1.HttpStatusCodes.CREATED).json({ message, group });
    }
    catch (error) {
        res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to send message' });
    }
}));
exports.sendGroupMessage = sendGroupMessage;
// Send a single message
const sendSingleMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { content, status } = req.body;
    const { receiverId } = req.params;
    const senderId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    let messageType = 'text';
    const receiver = yield user_model_1.User.findById(receiverId);
    const receiverName = receiver === null || receiver === void 0 ? void 0 : receiver.name;
    const receiverImage = receiver === null || receiver === void 0 ? void 0 : receiver.profilePicture;
    if (!senderId) {
        res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: 'Not authorized -- login to send a message.',
        });
        return;
    }
    if (!receiverId) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({
            message: 'Receiver ID is required.',
        });
        return;
    }
    try {
        let conversation = yield conversation_model_1.Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });
        if (!conversation) {
            conversation = new conversation_model_1.Conversation({
                participants: [senderId, receiverId],
                messages: [],
            });
        }
        const files = req === null || req === void 0 ? void 0 : req.files;
        let image;
        let audio;
        let video;
        let normalFile;
        if (files) {
            if ((files === null || files === void 0 ? void 0 : files.photo) && ((_b = files === null || files === void 0 ? void 0 : files.photo) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                try {
                    const result = yield (0, uploadFileHandler_1.uploadFileHandler)(files === null || files === void 0 ? void 0 : files.photo[0], 'image');
                    messageType = 'image';
                    if (result) {
                        image = {
                            id: result === null || result === void 0 ? void 0 : result.public_id,
                            url: result === null || result === void 0 ? void 0 : result.secure_url,
                            name: (_d = (_c = files === null || files === void 0 ? void 0 : files.photo[0]) === null || _c === void 0 ? void 0 : _c.originalname) === null || _d === void 0 ? void 0 : _d.toString(),
                        };
                    }
                }
                catch (error) {
                    res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: `Error sending image: ${error === null || error === void 0 ? void 0 : error.message}` });
                    return;
                }
            }
            if ((files === null || files === void 0 ? void 0 : files.audio) && ((_e = files === null || files === void 0 ? void 0 : files.audio) === null || _e === void 0 ? void 0 : _e.length) > 0) {
                try {
                    const result = yield (0, uploadFileHandler_1.uploadFileHandler)(files === null || files === void 0 ? void 0 : files.audio[0], 'raw');
                    messageType = 'audio';
                    if (result) {
                        audio = {
                            id: result.public_id,
                            url: result.secure_url,
                            name: (_g = (_f = files === null || files === void 0 ? void 0 : files.audio[0]) === null || _f === void 0 ? void 0 : _f.originalname) === null || _g === void 0 ? void 0 : _g.toString(),
                        };
                    }
                }
                catch (error) {
                    res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                        message: `error sending audio ${error === null || error === void 0 ? void 0 : error.message}`
                    });
                    return;
                }
            }
            if ((files === null || files === void 0 ? void 0 : files.video) && ((_h = files === null || files === void 0 ? void 0 : files.video) === null || _h === void 0 ? void 0 : _h.length) > 0) {
                try {
                    const result = yield (0, uploadFileHandler_1.uploadFileHandler)(files === null || files === void 0 ? void 0 : files.video[0], 'video');
                    messageType = 'video';
                    if (result) {
                        video = {
                            id: result === null || result === void 0 ? void 0 : result.public_id,
                            url: result === null || result === void 0 ? void 0 : result.secure_url,
                            name: (_k = (_j = files === null || files === void 0 ? void 0 : files.video[0]) === null || _j === void 0 ? void 0 : _j.originalname) === null || _k === void 0 ? void 0 : _k.toString(),
                        };
                    }
                }
                catch (error) {
                    res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                        message: `error sending video: ${error === null || error === void 0 ? void 0 : error.message}`
                    });
                    return;
                }
            }
            if ((files === null || files === void 0 ? void 0 : files.normalFile) && ((_l = files === null || files === void 0 ? void 0 : files.normalFile) === null || _l === void 0 ? void 0 : _l.length) > 0) {
                try {
                    const result = yield (0, uploadFileHandler_1.uploadFileHandler)(files.normalFile[0], 'raw');
                    messageType = 'file';
                    if (result) {
                        normalFile = {
                            id: result === null || result === void 0 ? void 0 : result.public_id,
                            url: result === null || result === void 0 ? void 0 : result.secure_url,
                            name: (_o = (_m = files.normalFile[0]) === null || _m === void 0 ? void 0 : _m.originalname) === null || _o === void 0 ? void 0 : _o.toString(),
                        };
                    }
                }
                catch (error) {
                    res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                        message: `Error sending file: ${error === null || error === void 0 ? void 0 : error.message}`
                    });
                }
            }
        }
        const fileUrl = messageType === 'image' ? image :
            messageType === 'audio' ? audio :
                messageType === 'video' ? video :
                    messageType === 'file' ? normalFile : undefined;
        const newMessage = new message_model_1.Message({
            sender: senderId,
            chatType: 'Conversation',
            chat: conversation._id,
            messageType,
            receiver: receiverId,
            content,
            status,
            fileUrl
        });
        const savedMessage = yield newMessage.save();
        const message = yield newMessage.populate([
            { path: 'sender', populate: { path: 'profilePicture' } },
            { path: 'receiver', populate: { path: 'profilePicture' } }
        ]);
        conversation.latestMessage = savedMessage._id;
        conversation.messages.push(savedMessage._id);
        yield conversation.save();
        const receiverSocketId = (0, socket_1.getReceiverSocketId)(receiverId);
        if (receiverSocketId) {
            socket_1.io.to(receiverSocketId).emit('receive-message', message);
            socket_1.io.to(receiverSocketId).emit('message-notification', { message: message === null || message === void 0 ? void 0 : message.content, sender: (_p = req === null || req === void 0 ? void 0 : req.user) === null || _p === void 0 ? void 0 : _p._id, receiver: { id: receiverId, name: receiverName, photo: receiverImage } });
        }
        else {
            console.warn(`Receiver socket ID not found for user: ${receiverId}`);
        }
        res.status(httpStatusCodes_1.HttpStatusCodes.CREATED).json({
            message
        });
    }
    catch (error) {
        res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to send message.',
        });
    }
}));
exports.sendSingleMessage = sendSingleMessage;
const getSingleMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id: userToChat } = req.params;
    const senderId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    // Find the conversation between the sender and receiver
    const conversation = yield conversation_model_1.Conversation.findOne({
        participants: {
            $all: [senderId, userToChat],
        },
    }).populate({
        path: 'messages', // Populate messages
        populate: [
            { path: 'sender', select: 'name email phone', populate: { path: 'profilePicture' } }, // Populate sender details (name, email, etc.)
            { path: 'receiver', select: 'name email phone', populate: { path: 'profilePicture' } }, // Populate receiver details (name, email, etc.)
        ],
    });
    // if (!conversation) {
    //   res.status(HttpStatusCodes.OK).json([]);
    // }
    const messages = conversation === null || conversation === void 0 ? void 0 : conversation.messages;
    res.json({ messages });
}));
exports.getSingleMessage = getSingleMessage;
const getLastMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id: userToChat } = req.params;
    const senderId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    // Find the conversation between the sender and receiver
    const conversation = yield conversation_model_1.Conversation.findOne({
        participants: {
            $all: [senderId, userToChat],
        },
    }).populate({
        path: 'latestMessage', // Populate messages
    });
    // if (!conversation) {
    //   res.status(HttpStatusCodes.OK).json([]);
    // }
    const latestMessage = conversation === null || conversation === void 0 ? void 0 : conversation.latestMessage;
    res.json({ latestMessage });
}));
exports.getLastMessage = getLastMessage;
// Get all messages for a chat
const getMessagesByChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: chatId } = req.params;
    const messages = yield message_model_1.Message.find({ chat: chatId, isDeleted: false })
        .populate('sender', 'name profilePicture')
        .populate('receiver', 'name profilePicture')
        .sort({ createdAt: 1 });
    if (!messages.length) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'No messages found.' });
        return;
    }
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json(messages);
}));
exports.getMessagesByChat = getMessagesByChat;
// Delete a single message (soft delete)
const deleteMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: messageId } = req.params;
    const message = yield message_model_1.Message.findByIdAndDelete(messageId);
    if (!message) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'Message not found.' });
        return;
    }
    message.isDeleted = true;
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json({ message: 'Message deleted successfully.' });
}));
exports.deleteMessage = deleteMessage;
// Delete multiple messages
const deleteMultipleMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageIds } = req.body;
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid or empty message ID list.' });
        return;
    }
    const result = yield message_model_1.Message.updateMany({ _id: { $in: messageIds }, isDeleted: false }, { isDeleted: true });
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json({
        message: 'Messages deleted successfully.',
        count: result.modifiedCount,
    });
}));
exports.deleteMultipleMessages = deleteMultipleMessages;
// Toggle the like state of a message
const toggleLikeMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: messageId } = req.params;
    const message = yield message_model_1.Message.findById(messageId);
    if (!message) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'Message not found.' });
        return;
    }
    message.isLiked = !message.isLiked;
    yield message.save();
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json({ message: 'Message like state updated.', data: message });
}));
exports.toggleLikeMessage = toggleLikeMessage;
// Toggle the pin state of a message
const togglePinMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: messageId } = req.params;
    const message = yield message_model_1.Message.findById(messageId);
    if (!message) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'Message not found.' });
        return;
    }
    message.isPinned = !message.isPinned;
    yield message.save();
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json({ message: 'Message pin state updated.', data: message });
}));
exports.togglePinMessage = togglePinMessage;
// Mark all messages in a chat as read
const markMessagesAsRead = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id: chatId } = req.params;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    const result = yield message_model_1.Message.updateMany({ chat: chatId, readBy: { $ne: userId }, isDeleted: false }, { $addToSet: { readBy: userId }, status: 'read' });
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json({ message: 'Messages marked as read.', count: result.modifiedCount });
}));
exports.markMessagesAsRead = markMessagesAsRead;
// Search messages in a chat
const searchMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: chatId } = req.params;
    const { keyword } = req.query;
    if (!keyword) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Search keyword is required.' });
        return;
    }
    const messages = yield message_model_1.Message.find({
        chat: chatId,
        content: { $regex: keyword, $options: 'i' },
        isDeleted: false,
    }).limit(50);
    if (!messages.length) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'No messages found.' });
        return;
    }
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json(messages);
}));
exports.searchMessages = searchMessages;
