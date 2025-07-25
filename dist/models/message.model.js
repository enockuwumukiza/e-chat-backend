"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const messageSchema = new mongoose_1.Schema({
    content: {
        type: String, trim: true,
        validate: {
            validator: function (value) {
                if (this.messageType === 'text') {
                    return value !== null && value.trim() !== '';
                }
                return true;
            },
            message: 'content is required'
        }
    },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chatType: {
        type: String,
        enum: ['Group', 'Conversation'],
        required: true,
    },
    chat: { type: mongoose_1.Schema.Types.ObjectId, refPath: 'chatType' },
    readBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    receiver: { type: mongoose_1.default.Types.ObjectId, ref: 'User' },
    fileUrl: {
        id: { type: String },
        url: { type: String },
        name: { type: String },
    },
    attachment: { type: String },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'video', 'audio'],
        default: 'text',
    },
    reactions: [
        {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            emoji: { type: String, required: true },
        },
    ],
    isDeleted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isLiked: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent',
    },
}, { timestamps: true });
messageSchema.index({ chat: 1, createdAt: -1 }); // Index to speed up message retrieval per chat
exports.Message = mongoose_1.default.model('Message', messageSchema);
