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
exports.uploadMedia = void 0;
const urlGenerator_1 = require("../utils/urlGenerator");
const cloudinary_1 = __importDefault(require("cloudinary"));
const uploadMedia = (fileBuffer_1, type_1, ...args_1) => __awaiter(void 0, [fileBuffer_1, type_1, ...args_1], void 0, function* (fileBuffer, type, transformations = {}) {
    try {
        if (!fileBuffer)
            throw new Error('No file provided');
        const fileBufferUrl = (0, urlGenerator_1.getFileUrl)(fileBuffer);
        if (!fileBufferUrl.content)
            throw new Error('Failed to generate file URL');
        // Upload to Cloudinary
        const result = yield cloudinary_1.default.v2.uploader.upload(fileBufferUrl.content, {
            resource_type: type,
            folder: 'media_files',
        });
        return result;
    }
    catch (error) {
        throw new Error(`Error uploading file: ${error.message || 'Unknown error'}`);
    }
});
exports.uploadMedia = uploadMedia;
