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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileHandler = void 0;
const uploadMedia_1 = require("../middlewares/uploadMedia");
const uploadFileHandler = (file, type) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file) {
        throw new Error('No file provided.');
    }
    try {
        let transformation;
        // Define transformation options based on type
        switch (type) {
            case 'image':
                transformation = {
                    transformation: {
                        width: 800,
                        height: 800,
                        crop: 'fill',
                        gravity: 'center',
                        format: 'png',
                    },
                };
                break;
            case 'video':
                transformation = {
                    transformation: [
                        {
                            width: 1280,
                            height: 720,
                            crop: 'limit',
                            quality: 'auto',
                            format: 'mp4',
                        },
                        {
                            overlay: 'your_watermark_id',
                            gravity: 'south_east',
                            x: 10,
                            y: 10,
                            opacity: 50,
                        },
                        { effect: 'sepia' },
                        { start_offset: 10, end_offset: 60 },
                    ],
                };
                break;
            case 'raw':
                transformation = undefined; // No transformation for raw files
                break;
            default:
                throw new Error('Unsupported media type.');
        }
        // Upload media with the corresponding transformation
        const mediaUrl = yield (0, uploadMedia_1.uploadMedia)(file, type, transformation);
        // Validate response
        if (!mediaUrl || !mediaUrl.public_id || !mediaUrl.secure_url) {
            throw new Error(`Failed to upload ${type} to Cloudinary`);
        }
        return mediaUrl;
    }
    catch (error) {
        throw new Error(`Error uploading media: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
    }
});
exports.uploadFileHandler = uploadFileHandler;
